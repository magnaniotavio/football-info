import React from 'react';
import SearchInput from './SearchInput';
import axios from 'axios';
import './style.css';

class App extends React.Component{
  
constructor(props) {
        super(props)
        this.state = { ApiData: " ", value: 'player', title: " "};
        this.errorMessage = "The search you made has returned no results."
        this.onSearchSubmit = this.onSearchSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.GetWikipediaSection = this.GetWikipediaSection.bind(this);
        this.SpecifyWikipediaSection = this.SpecifyWikipediaSection.bind(this);
        this.WikiJSONStringCleaner = this.WikiJSONStringCleaner.bind(this);
        this.GetPlayerInfobox = this.GetPlayerInfobox.bind(this);
        this.GetArticleImage = this.GetArticleImage.bind(this);
        this.StringifyResponse = this.StringifyResponse.bind(this);
    }

handleChange(event) {
      this.setState({value: event.target.value});
    }

WikiJSONStringCleaner(JSONstring) {
      return JSONstring.replace(/{"data":.*"text":"/i, "").replace(/"}},".*request":{}}/i, "").replaceAll("\\n", " ").replaceAll("href", " ").
        replaceAll(/<img alt=.*?">/g, "").replaceAll("<table border=\\" + "\"0\\\"" + ">", "").replaceAll(/<span\sclass=\\"mw-editsection.*?span>/g, "").
        replaceAll(">edit<", "")
   }

async GetArticleImage(entry) {
      const Imageurl = "https://en.wikipedia.org/w/api.php?action=query&origin=*&prop=pageimages&titles=" + entry + "&formatversion=2&format=json";
      const Imageresponse = await axios.get(Imageurl)
      const ImageLink = JSON.stringify(Imageresponse.data.query.pages[0].thumbnail.source)
      const ImageSizeAdjust = ImageLink.replace("50px", "200px")
      const ImageHTML = "<img src=" + ImageSizeAdjust +"alt=" + entry + " class='PlayerImage'>";
            return ImageHTML
}

async StringifyResponse(searchDetails, method) {
  const adress = "https://en.wikipedia.org/w/api.php?action=" + searchDetails;
  const response = await method(adress) 
      if (method === axios.get) {
        if(response.data.error) {
          this.setState({ApiData: this.errorMessage})
        }
        else {const JSONstring = JSON.stringify(response);
        const cleanString = this.WikiJSONStringCleaner(JSONstring);
              return cleanString}
      } 
      else if (method === fetch) {
        const result = await response.json()
              if (typeof result.parse === 'object') {
                return result
              }
                else {return this.errorMessage}
              }
}

async GetPlayerInfobox(entry) {
  const regex2 = new RegExp(/<table\sclass=\\"infobox.*?table>/g)
  const result = await this.StringifyResponse("parse&origin=*&page=" + entry + "&section=" + 0 + "&prop=text&formatversion=2&format=json", axios.get)
  const ResultWithImage = result.replace(/<caption.*?<\/caption>/, "").replaceAll("\\\"infobox-header\\\"", "infobox-header")
  const resultado2 = ResultWithImage.match(regex2)
  const PlayerImage = await this.GetArticleImage(entry)
  this.setState({ApiData: PlayerImage + resultado2})
}

async GetWikipediaSection(x, y) {
    const result = await this.StringifyResponse("parse&origin=*&page=" + x + "&section=" + y + "&prop=text&formatversion=2&format=json", axios.get)
    this.setState({ApiData: result});
}

async SpecifyWikipediaSection(entry, option_section) {
    const result = await this.StringifyResponse("parse&origin=*&format=json&page=" + entry + "&prop=sections&disabletoc=1", fetch)
    let i;
    if (result === this.errorMessage) {
      this.setState({ApiData: this.errorMessage})
    }
    else {
      for (i = 0; i <= result.parse.sections.length; i++) {
        if (result.parse.sections[i].anchor === option_section) {
           this.GetWikipediaSection(entry, i+1)
        } 
        if (i === result.parse.sections.length-1 && result.parse.sections[i].anchor != option_section) {
          this.setState({ApiData: this.errorMessage})}
      }
    }
 }      

async onSearchSubmit(entry){

     if (this.state.value === 'player') {
        this.setState({title: entry})
        this.GetPlayerInfobox(entry)
      } 

      if (this.state.value === 'club') {
        this.setState({title: entry})
        this.SpecifyWikipediaSection(entry, "Players")
      }

      else if (this.state.value === 'league') {
        this.setState({title: entry})
        this.SpecifyWikipediaSection(entry, "League_table")
      }
    }

render(){
        return (
        <div className="body">
        <div className="header">
        <form>
            <label>
            Search Type:
              <select value={this.state.value} onChange={this.handleChange} className="select">
                <option value="player">Player</option>
                <option value="club">Club</option>
                <option value="league">League</option>
              </select>
          </label>            
          </form>
             <SearchInput onSearchSubmit={this.onSearchSubmit}/>
          </div>
          <div className="search-result-block">
              {<div dangerouslySetInnerHTML={{ __html: this.state.title }} className="title"/>}
              {<div dangerouslySetInnerHTML={{ __html: this.state.ApiData }} className="search-result"/>}
          </div>
        </div>
        )
    }
}

export default App;



//replace(/{"data".*extract":"/i, "").//replace(/"}}}},".*request":{}}/i, "").