import React,{Component} from 'react'
import {render} from 'react-dom'

import i18n from './i18n';
import Test from './components/Test';

i18n.init({
        translation : {
          "key": "hello 改CCCCC333变这里的值",
          "k_0375zxu":"xxxxxxxxxx"
        }
    }
  );

class Home extends Component{
    constructor(props){
       super()
       this.state = {
           msg:i18n.t("key")
       }
    }
    changeTitle(){
        this.setState({
            msg:'内容SSS改变了'
        })
    }
    render(){
        return (
            <div> 
                <h1>{this.state.msg}</h1>
                <p><button onClick={()=>this.changeTitle()}>点击变化</button></p>
                <Test></Test>
            </div>
        )
    }
}



render(<Home></Home>,document.getElementById('root'))