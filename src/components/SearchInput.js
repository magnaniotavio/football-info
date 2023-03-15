import React from 'react';

/* In this class we set the entry as the text which is writen in search-bar form 
at the moment we make the search. Once the entry is set, the code in the App.js file
will be able to operate on it. */
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
// Handles the changes by setting the state
            onChange={(event) => this.setState({entry:event.target.value})}
// Sets the entry as the value of the form
            value={this.state.entry}
            />
      </form>
    </div>
  )
}
}

export default SearchInput;

