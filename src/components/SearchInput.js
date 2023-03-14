import React from 'react';

class SearchInput extends React.Component {
  
  constructor(props){
    super(props)
    this.state = {entry: ''}
    this.onFormSubmit = this.onFormSubmit.bind(this)
  }

onFormSubmit = (event) => {
  event.preventDefault();
  this.props.onSearchSubmit(this.state.entry)
}

render() {
  return(
    <div>
      <form onSubmit={this.onFormSubmit}>
            <input 
            className="search-bar"
            type="text"
            placeholder='search...'
            onChange={(event) => this.setState({entry:event.target.value})}
            value={this.state.entry}
            />
      </form>
    </div>
  )
}
}

export default SearchInput;

