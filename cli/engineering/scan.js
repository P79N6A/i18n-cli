// @ts-check
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const hashString = require('hash-string');
const Vinyl = require('vinyl');
const vfs = require('vinyl-fs');
const map = require('map-stream');
const sort = require('gulp-sort');
const i18nScanner = require('i18next-scanner');

// 从句子计算哈希一个 key 值，该算法需要和 scanner 保持一致
const hashKey = (value) => 'k_' + ('0000' + hashString(value.replace(/\s+/g, '')).toString(36)).slice(-7);

// 左边是给到 i18n-scanner 的标准语言名字，右边是我们使用的名字
const lngs = {
  zh: 'zh',
  en: 'en',
  ja: 'jp',
  ko: 'ko',
}

/**
 * 扫描源码中的词条，合并到词条文件中
 * @param {string} appPath 要扫描的应用目录
 */
const scan = (appPath) => {
  let scannedFileCount = 0;

  vfs.src('src/**/*.{js,jsx,ts,tsx}', { cwd: appPath })
    // 对文件进行排序，保证词条有一定的顺序
    .pipe(sort())

    // 每个文件扫描前，统计文件数量
    // @ts-ignore
    .pipe(map((file, cb) => {
      ++scannedFileCount;
      cb(null, file);
    }))

    // 扫描词条
    .pipe(scanner())


   


    // 创建词条文件
    .pipe(map(writer(appPath)))

    // 写入词条文件
    .pipe(vfs.dest(appPath))
    .on('finish', () => console.log(`Scanned ${scannedFileCount} files.`));

    console.log("appPath: "+ appPath);
};

/**
 * 扫描词条
 */
function scanner() {
  const options = {
    lngs: Object.keys(lngs),
    ns: ['translation'],
    defaultLng: 'zh',
    defaultNs: 'translation',
    resource: {
      savePath: 'i18n/{{ns}}/{{lng}}'
    }
  };
  /**
   * @param {import('vinyl')} file
   * @param {string} encoding
   * @param {Function} done
   */
  function transform(file, encoding, done) {

debugger;
    console.log("---------transform---------------")

    const { parser } = this;
    const extname = path.extname(file.path);

    // 只扫描 js/jsx
    if (!['.js', '.jsx'].includes(extname)) {
      return done();
    }

    const content = file.contents.toString();

    parser.parseFuncFromString(content, { list: ['t', 'i18n.t'] }, (sentence, options) => {
      const key = hashKey(sentence);
      console.log(key)
      console.log(options)
      options.defaultValue = sentence;
      parser.set(key, options);
    });

    parser.parseTransFromString(content, (transKey, options) => {
      let sentence = options.defaultValue;
      sentence = sentence.replace(/<(\d+)>{{(\w+)}}<\/\1>/g, '{{$2}}');
      sentence = sentence.replace(/\s+/g, ' ');
      transKey = transKey || hashKey(sentence);
      options.defaultValue = sentence;

      parser.set(transKey, options);
    });
    done();
  }
  return i18nScanner.createStream(options, transform);
}

/**
 * 更新词条
 * @param {string} appPath
 */
function writer(appPath) {
  const lngFileTpl = fs.readFileSync(path.join(__dirname, './resource/lng.js.tpl'), 'utf8');

  const exists = {
    zh: read(appPath, 'zh'),
    en: read(appPath, 'en'),
  };

  /**
   * 
   * @param {import('vinyl')} file 
   * @param {Function} cb 
   */
  const write = (file, cb) => {

    debugger;
    // 统计新词条和就词条的数量
    let newKeyCount = 0, matchKeyCount = 0, oldKeyCount = 0;

    // 文件名就是对应语言
    const lng = lngs[file.basename];

    // 默认情况下，缺失的词条可以先用英文版的词条填充，英文版的词条缺失，使用中文版的填充
    const fallbackLng = lng === 'en' ? 'zh' : 'en';

    // 当前已存在的翻译内容
    const { translation } = exists[lng] = exists[lng] || read(appPath, lng);
    
    // 确定需要使用的词条
    const usage = [];

    // 需要标记为废弃的词条
    const obsoleted = [];

    // 词条扫描结果
    const scanResult = JSON.parse(file.contents.toString('utf8'));

    // 遍历扫描结果
    for (let [key, resource] of Object.entries(scanResult)) {
      // 词条不存在
      if (!translation[key]) {
        newKeyCount++;
        // 使用 fallback 词条，或者未翻译的词条
        usage.push([key, exists[fallbackLng].translation[key] || resource]);
      }
      // 词条已存在，并且被扫描到了，直接加到 usage 中
      else {
        matchKeyCount++;
        usage.push([key, translation[key]]);
      }
    }

    // 遍历原词条，对于那些没在扫描结果里的词条，标记为废弃词条
    for (let [key, resource] of Object.entries(translation)) {
      if (!scanResult[key]) {
        oldKeyCount++;
        obsoleted.push([key, resource]);
      }
    }

    const serialize = list => list.map(([key, resource]) => `  "${key}": ${JSON.stringify(resource)},`).join('\n');
    const translationLines = [];

    if (usage.length) {
      translationLines.push('  // 使用中的词条');
      translationLines.push(serialize(usage));
    }
    if (obsoleted.length) {
      if (usage.length) {
        translationLines.push('\n');
      }
      translationLines.push('  // 未使用的词条，可能是旧词条');
      translationLines.push(serialize(obsoleted));
    }

    const fileContentString = lngFileTpl.replace(/__\$\$\(translation\)__/g, translationLines.join('\n'));

    const resourceFile = new Vinyl({
      cwd: file.cwd,
      base: file.base,
      contents: Buffer.from(fileContentString, 'utf8'),
      path: `i18n/translation/${lng}.js`
    });

    console.log(
      `%s: %s new keys, %s match keys, %s obsoleted keys`,
      colors.bold(lng),
      colors.green(newKeyCount.toString()),
      colors.gray(matchKeyCount.toString()),
      colors.yellow(oldKeyCount.toString()),
    );

    cb(null, resourceFile);
  }
  return write;
}

/**
 * 读取现有词条
 * @param {string} appPath
 * @param {string} lng 
 */
function read(appPath, lng) {
  try {
    return require(path.join(appPath, 'i18n', 'translation', lng));
  }
  catch (err) {
    return { translation: {} };
  }
}

// 直接启动的，从参数获取启动路径
// @ts-ignore
if (module === require.main) {
  let appPath = process.argv[2];
  if (!appPath) {
    console.log('Usage: node scan [appPath]');
    process.exit(0);
  }
  if (!path.isAbsolute(appPath)) {
    appPath = path.join(process.cwd(), appPath);
  }
  scan(appPath);
}
// 被引用的情况下，导出 start 方法
else {
  module.exports = { scan };
}