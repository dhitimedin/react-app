import React, { Component} from "react";
import 'babel-polyfill';
import axios from 'axios';
import { sortBy } from 'lodash';
import {hot} from "react-hot-loader";
import styles from "./App.module.css";
import Check from './check.svg';


const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENT: list => sortBy(list, 'num_comments').reverse(),
  POINT: list => sortBy(list, 'points').reverse(),
};

const List = ( { list, onRemoveItem} ) => {
  
    const [ sort, setSort ] = React.useState({
      sortKey: 'NONE',
      isReverse: false,
    });

    const handleSort = sortKey => {
      const isReverse = sort.sortKey === sortKey && !sort.isReverse;
      setSort({ sortKey: sortKey, isReverse: isReverse });
    };    

  const sortFunction = SORTS[ sort.sortKey ];
  const sortedList = sort.isReverse
                          ? sortFunction(list).reverse()
                          : sortFunction(list);

  return (
      <>
        <div style={{ display: 'flex' }}>
          <span style={{ width: '40%' }}>
            <button type="button" onClick={() => handleSort('TITLE')}>
              Title
            </button>
          </span>
          <span style={{ width: '30%' }}>
            <button type="button" onClick={() => handleSort('AUTHOR')}>
              Author
            </button>
          </span>
          <span style={{ width: '10%' }}>
            <button type="button" onClick={() => handleSort('COMMENT')}>
              Comments
            </button>
          </span>
          <span style={{ width: '10%' }}>
            <button type="button" onClick={() => handleSort('POINT')}>
              Points
            </button>
          </span>
          <span style={{ width: '10%' }}>Actions</span>
        </div>      
        {sortedList.map( item => (
          <Item
            key={ item.objectID }
            item= { item }
            onRemoveItem={ onRemoveItem }
          />
        ))}
      </>
    );
};

const API_BASE = 'https://hn.algolia.com/api/v1';
const API_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';  

const Item = ( { item, onRemoveItem } ) => (
  <div className={styles.item}>
    <span style={{ width: '40%' }}>
      <a href={ item.url }>{ item.title }</a>
    </span>
    <span style={{ width: '30%' }}>{ item.author }</span>
    <span style={{ width: '10%' }}>{ item.num_comments }</span>
    <span style={{ width: '10%' }}>{ item.points }</span>
    <span style={{ width: '10%' }}>
      <button 
        type="button" 
        onClick={ () => onRemoveItem(item) }
        className={`${styles.button} ${styles.buttonSmall}`}
      >
        <Check className={styles.check} />
      </button>
    </span>      
  </div>
);

const useSemiPersistentState = ( key, initialValue ) => {
  const [ value, setValue ] = React.useState(
    localStorage.getItem(key) || initialValue
  );

  React.useEffect(() => {

    localStorage.setItem(key, value);
  }, [value, key]);

  return [ value, setValue ];
};

const storiesReducer = ( state, action ) => {
  switch ( action.type ) {
    case 'STORIES_FETCH_INIT':
      return {
      ...state,
      isLoading: true,
      isError: false,
      };
      case 'STORIES_FETCH_SUCCESS':
        return {
          ...state,
          isLoading: false,
          isError: false,
          data:
            action.payload.page === 0
            ? action.payload.list
            : state.data.concat(action.payload.list),
          page: action.payload.page,
        };
      case 'STORIES_FETCH_FAILURE':
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      case 'REMOVE_STORY':
        return {
          ...state,
          data: state.data.filter(
            story => action.payload.objectID !== story.objectID
          ),
        };
      default:
        throw new Error();
  }
};

const extractSearchTerm = url => {
            url = url
              .substring(url.lastIndexOf('?') + 1, url.lastIndexOf('&'))
              .replace(PARAM_SEARCH, '');
            console.log(url);
            return url;
}

const getLastSearches = urls => {

  let terms = [];
  if( urls.length > 1 ){
    let searchedTerm =  urls.slice( -1 );
    let index = urls.indexOf( searchedTerm[0] );

    if( index !== -1 && index !== ( urls.length - 1) ) {
      urls.splice( index, 1 );
    } 
    terms       = ( urls.length < 6 ) ? 
                  urls.slice( 0, urls.length - 1 ).map(extractSearchTerm) : 
                  urls.slice( -6, -1 ).map(extractSearchTerm);   
  }

  return terms

}

const getUrl =  (searchTerm, page) => `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;
  
const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState( 'search', 'React' );

  const [urls, setUrls] = React.useState([getUrl(searchTerm, 0)]);

  const lastSearches = getLastSearches(urls);

  const handleMore = () => {
    const lastUrl = urls[urls.length - 1];
    const searchTerm = extractSearchTerm(lastUrl);
    handleSearch(searchTerm, stories.page + 1);
  };
  
  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    handleSearch(searchTerm, 0);
    event.preventDefault();
  };

  const handleLastSearch = searchTerm => {
    handleSearch(searchTerm, 0);
    setSearchTerm(searchTerm);
  };

  const handleSearch =  (searchTerm, page) => {
    const url = getUrl(searchTerm, page);
    
    setUrls(urls.concat(url));

  };

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], page: 0, isLoading: false, isError: false }
  );

  const handleFetchStories = React.useCallback( async () => {

    dispatchStories({ type: 'STORIES_FETCH_INIT' });
    try {

      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);      

      //const result = await axios.get( url );

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: {
          list: result.data.hits,
          page: result.data.page,
        },
      });
    }
    catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }

  }, [urls]); // E  

  React.useEffect( () => {
    handleFetchStories();
  }, [handleFetchStories] );  

  const handleRemoveStory = item => {

    dispatchStories( {
      type: 'REMOVE_STORY',
      payload: item,
    } );    
  };  

  /*  const searchedStories = stories.data.filter(  story =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );  */

    return(
      <div className={styles.App}>
        <h1 className={styles.headlinePrimary}> My Hacker Stories</h1>
        <Search search={ searchTerm } onSearchInput = { handleSearchInput } onSearchSubmit = {handleSearchSubmit} />
          <LastSearches
            lastSearches={lastSearches}
            onLastSearch={handleLastSearch}
          />
        <p>Search Term is: { searchTerm } </p>
        {stories.isError && <p>Something went wrong ...</p>}
        <List list = { stories.data } onRemoveItem={ handleRemoveStory } />
        { stories.isLoading ? (
          <p>Loading ...</p>
        ) : (
          <button type="button" onClick={ handleMore }>
          More
        </button>          
        ) }

      </div>
    );
}

const LastSearches = ({ lastSearches, onLastSearch }) => (
  <>
    {lastSearches.map((searchTerm, index) => (
      <button
        key={searchTerm + index}
        type="button"
        onClick={() => onLastSearch(searchTerm)}
      >
        {searchTerm}
      </button>
    ))}
  </>
);

const Search = ( { search, onSearchInput, onSearchSubmit } ) => (
  <form onSubmit={onSearchSubmit} className={styles.searchForm}>
      <InputWithLabel
        id="search"
        value={ search }
        isFocused
        onInputChange={ onSearchInput }
      >
        <strong>Search: </strong>
      </InputWithLabel>
      <button
        type="submit"
        disabled={!search}
        className={`${styles.button} ${styles.button_large}`}
      >
        Submit
      </button>      
    </form>
  )

const InputWithLabel = ({ id, value, type = 'text', onInputChange, isFocused, children }) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);  
  
  return(
    <>
      <label htmlFor={id}  className={styles.label}>{ children }</label>
      &nbsp;
      <input
        ref= { inputRef }
        id={id}
        type={ type }
        value={value}
        onChange={onInputChange}
        className={styles.input}
      />
    </>
  );
}    

export default hot(module)(App);