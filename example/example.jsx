import React from 'react'
import Test from './test.css'

class Woah extends React.Component{
	render(){
		return <div className="test">{this.props.message}</div>
	}
}

Woah.defaultProps = {
    message: 'this is sick'
}
