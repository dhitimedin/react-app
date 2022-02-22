import React, { Component} from "react";
import {hot} from "react-hot-loader";
import "./App.css";

const List = ( { list, onRemoveItem} ) => 
  list.map( item => 
    <Item
      key={ item.objectID }
      item= { item }
      onRemoveItem={ onRemoveItem }
    /> 
  );

const Item = ( { item, onRemoveItem } ) => (
  <div>
    <span>
      <a href={ item.url }>{ item.title }</a>
    </span>
    <span>{ item.author }</span>
    <span>{ item.num_comments }</span>
    <span>{ item.points }</span>
    <span>
      <button type="button" onClick={ () => onRemoveItem(item) }>
        Dismiss
      </button>
    </span>      
  </div>
);

const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

const getAsyncStories = () =>
  new Promise(resolve =>
    setTimeout(
      () => resolve({ data: { stories: initialStories } }),
      2000
    )
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
    case 'SET_STORIES':
      return action.payload;
    case 'REMOVE_STORY':
      return state.filter(
        story => action.payload.objectID !== story.objectID
      );
    default:
      throw new Error();
  }
};

  
const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState( 'search', 'React' );

  //const [ stories, setStories ] = React.useState( [] );
  const [ isLoading, setIsLoading ] = React.useState( false );
  const [ isError, setIsError ] = React.useState(false);
  const [ stories, dispatchStories ] = React.useReducer(
    storiesReducer,
    [],
  );

  React.useEffect( () => {
    setIsLoading( true );

    getAsyncStories().then( result => {
      //setStories( result.data.stories );
      dispatchStories( {
        type: 'SET_STORIES',
        payload: result.data.stories,
      } );
      setIsLoading( false );
    } )
    .catch( () => setIsError( true ) );
  }, [] );  

  const handleSearch = event => {
    setSearchTerm( event.target.value );
  };

  const handleRemoveStory = item => {
    /*const newStories = stories.filter(
      story => item.objectID !== story.objectID
    );*/

    dispatchStories( {
      type: 'REMOVE_STORY',
      payload: item,
    } );    
    //setStories(newStories);
  };  

    const searchedStories = stories.filter(  story =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );  

    return(
      <div className="App">
        <h1> My Hacker Stories</h1>
        <Search search={ searchTerm } onSearch = { handleSearch } />
        <p>Search Term is: { searchTerm } </p>
        <hr />
        {isError && <p>Something went wrong ...</p>}
        { isLoading ? (
          <p>Loading ...</p>
        ) : (
          <List list = { searchedStories } onRemoveItem={ handleRemoveStory } />
        ) }
      </div>
    );
}

const Search = ( { search, onSearch } ) => (
    <div>
      <InputWithLabel
        id="search"
        value={ search }
        isFocused
        onInputChange={ onSearch }
      >
        <strong>Search: </strong>
      </InputWithLabel>
    </div>
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
      <label htmlFor={id}>{ children }</label>
      &nbsp;
      <input
        ref= { inputRef }
        id={id}
        type={ type }
        value={value}
        onChange={onInputChange}
      />
    </>
  );
}    

export default hot(module)(App);