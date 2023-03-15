import React from 'react';
import SearchInput from './SearchInput';
import axios from 'axios';
import './style.css';

/* This app allows you to look for information about football players, leagues and teams, by 
search for their name. It uses the Wikipedia Api and retrieves the main Wikipedia Infobox for the players; 
the league table for the leagues; and the full list of players for the clubs.
The code is sufficiently abstract that it can be easily adapted to other types of search too. */

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

// Sets the value of the Select element in the JSX
handleChange(event) {
      this.setState({value: event.target.value});
    }

/* When we get some content from the Wikipedia API, it usually comes in a reader-unfriendly format, containing such
elements as [edit], links, API information, etc. The following function uses the replace function, 
as well as regular expressions, to eliminate this visual polution from the page's HTML. */

WikiJSONStringCleaner(JSONstring) {
      return JSONstring.replace(/{"data":.*"text":"/i, "").replace(/"}},".*request":{}}/i, "").replaceAll("\\n", " ").replaceAll("href", " ").
        replaceAll(/<img alt=.*?">/g, "").replaceAll("<table border=\\" + "\"0\\\"" + ">", "").replaceAll(/<span\sclass=\\"mw-editsection.*?span>/g, "").
        replaceAll(">edit<", "")
   }

/* Allows for two different types of Api search (axios and fetch), each of which
can be used for a different kind of search. Once the search is made, this function stringifies the response. */
async StringifyResponse(searchDetails, method) {
    const adress = "https://en.wikipedia.org/w/api.php?action=" + searchDetails;
    const response = await method(adress) 
        if (method === axios.get) {
// Returns error message in case the data is not fetched, by testing whether it exists
          if(response.data.error) {
            this.setState({ApiData: this.errorMessage})
          }
          else {const JSONstring = JSON.stringify(response);
          const cleanString = this.WikiJSONStringCleaner(JSONstring);
                return cleanString}
        } 
        else if (method === fetch) {
          const result = await response.json()
/* Returns error message in case the data is not fecthed, 
by testing whether it's an object (because non-existent data is 'undefined') */
                if (typeof result.parse === 'object') {
                  return result
                }
                  else {return this.errorMessage}
                }
  }

/* Gets the URL of the main picture in the Wikipedia article, and will be used for the players,
although it can also be used for the teams, or however one prefers. The image is received 
at a thumbnail size, but is then resized to a larger one.*/
async GetArticleImage(entry) {
      const Imageurl = "https://en.wikipedia.org/w/api.php?action=query&origin=*&prop=pageimages&titles=" + entry + "&formatversion=2&format=json";
      const Imageresponse = await axios.get(Imageurl)
      const ImageLink = JSON.stringify(Imageresponse.data.query.pages[0].thumbnail.source)
// Resizes the image by altering the URL size specifications. This does not damage the image quality.
      const ImageSizeAdjust = ImageLink.replace("50px", "200px")
/* Gives the image the necessary HTML specifications, and adds a class name so that it can be easily repositioned in the CSS file.
This means that, once the page loads, it will show the actual image and not just the URL. */
      const ImageHTML = "<img src=" + ImageSizeAdjust +"alt=" + entry + " class='PlayerImage'>";
            return ImageHTML
}

//Gets the infobox of an article
async GetPlayerInfobox(entry) {
// Regular expression for the infobox 
  const regex2 = new RegExp(/<table\sclass=\\"infobox.*?table>/g)
// Gets the section 0 of the Wikipedia article, which is that of the infobox. 
  const result = await this.StringifyResponse("parse&origin=*&page=" + entry + "&section=" + 0 + "&prop=text&formatversion=2&format=json", axios.get)
// Cleans from the result some aditional Wikipedia text that disturb the flow of the reading.
  const cleanerResult = result.replace(/<caption.*?<\/caption>/, "").replaceAll("\\\"infobox-header\\\"", "infobox-header")
// Matches with the ReGex, thus selecting only the Infobox.
  const resultado2 = cleanerResult.match(regex2)
// Gets the player image
  const PlayerImage = await this.GetArticleImage(entry)
  this.setState({ApiData: PlayerImage + resultado2})
}

// This gets the text of a Wikipedia section, given an input of article title and section name
async GetWikipediaSection(articleTitle, sectionName) {
    const result = await this.StringifyResponse("parse&origin=*&page=" + articleTitle + "&section=" + sectionName + "&prop=text&formatversion=2&format=json", axios.get)
    this.setState({ApiData: result});
}

// This functions allows us to get a whole Wikipedia section, by using the fetch Api.
async SpecifyWikipediaSection(entry, option_section) {
    const result = await this.StringifyResponse("parse&origin=*&format=json&page=" + entry + "&prop=sections&disabletoc=1", fetch)
    let i;
// Checks for when the StringifyResponse function returns an error
    if (result === this.errorMessage) {
      this.setState({ApiData: this.errorMessage})
    }
/* Loops over all the Wikipedia sections until it finds one which corresponds to the option we want, 
then applies the GetWikipediaSection function in order to get its text */
    else {
      for (i = 0; i <= result.parse.sections.length; i++) {
        if (result.parse.sections[i].anchor === option_section) {
           this.GetWikipediaSection(entry, i+1)
        } 
// Checks for when the Wikipedia article exists, but there is no section with the name we want.
        if (i === result.parse.sections.length-1 && result.parse.sections[i].anchor != option_section) {
          this.setState({ApiData: this.errorMessage})}
      }
    }
 }      

// Here we set the type of search we want to make for each value in the Select element in the JSX 
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


