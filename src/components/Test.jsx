import React,{Component} from 'react'
import {render} from 'react-dom'
export default class Test extends Component{
    constructor(props){
       super()
       this.state = {
           msg:"3333"
       }
    }
    render(){
        return (
            <div>
                <h1>{this.state.msg}</h1>
            </div>
        )
    }
}
