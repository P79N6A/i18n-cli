import i18next from 'i18next';
import { Trans, I18nextProvider, reactI18nextModule } from 'react-i18next';
import * as hashString from 'hash-string';

// 是否已经初始化
let hasInited = false;

// 当前语言
// TODO: 使用控制台的数据
const lng: string = 'zh';

// 从句子计算哈希一个 key 值，该算法需要和 scanner 保持一致
const hashKey = (value: string) => 'k_' + ('0000' + hashString(value.replace(/\s+/g, '')).toString(36)).slice(-7);

/**
 * 国际化包括的信息以及所需的工具
 */
export const i18n = {
  /**
   * 当前用户的国际化语言，已知语言：
   *  - `zh` 中文
   *  - `en` 英文
   *  - `jp` 日语
   *  - `ko` 韩语
   */
  lng,

  /**
   * 当前用户所在站点
   *  - `1` 表示国内站；
   *  - `2` 表示国际站；
   * 
   * @type {1 | 2}
   */
  site: 1,

  /**
   * 注册国家
   */
  country: {
    name: "CN",
    code: "86"
  },

  /**
   * 初始化当前语言的国际化配置
   */
  init: ({ translation }: I18NInitOptions) => {
    if (hasInited) {
      console.warn('你已经初始化过 i18n，请勿重复初始化');
      return;
    }
    hasInited = true;
    i18next.use(reactI18nextModule).init({
      // 使用语言
      lng,
  
      // 英文版 fallback 到中文版，其它语言 fallback 到中文版
      fallbackLng: lng === 'en' ? 'zh' : 'en',

      // 翻译资源
      resources: {
        [lng]: { translation: translation }
      },
  
      ns: "translation",
      defaultNS: "translation",

      react: {
        hashTransKey: hashKey
      } as any
    });
  },

  /**
   * 标记翻译句子
   * 详细的标记说明，请参考 http://tapd.oa.com/QCloud_2015/markdown_wikis/view/#1010103951008390841
   */
  t: (sentence: string, options?: I18NTranslationOptions) => {
    const key = hashKey(sentence);
    return i18next.t(key, { ...(options || {}), defaultValue: sentence });
  },

  /**
   * 标记翻译组件
   * 详细的标记说明，请参考 http://tapd.oa.com/QCloud_2015/markdown_wikis/view/#1010103951008390841
   */
  Trans,
};

export const getI18NInstance = () => hasInited ? i18next : null;

/**
 * @internal 国际化容器，内部使用
 */
export const I18NProvider = I18nextProvider;

export interface I18NInitOptions {
  translation: I18NTranslation
}

export interface I18NTranslation {
  [key: string]: string;
}

export interface I18NTranslationOptions {
  /** 用于确定单复数的数量值 */
  count?: number;

  /** 用于确定上下文的说明文本，只能使用字符串常量，否则无法扫描 */
  context?: string;

  // 允许传入插值
  [key: string]: any;
}