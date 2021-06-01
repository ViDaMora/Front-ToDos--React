import './App.css';
import React, {useContext,createContext, useReducer,useEffect,useRef,useState} from 'react'

const HOST_API ="http://localhost:8080/api"
const initialState = {
  list:[],
  item:{}
}
//Se crea el contexto para poder acceder al state de la lista
const Store = createContext(initialState)

const Form = ()=>{
  const formRef = useRef(null)
  //Se usa el state, este proviene del contexto 
  const {dispatch,state:{item}} = useContext(Store)
  const [state,setState] = useState({})
  const onAdd = (event)=>{
    event.preventDefault();
    const request = {
      name: state.name,
      id: null,
      isComplete:false
    }

    //Se instancia la peticion para agregar un to do a la base de datos.
    fetch(HOST_API+"/todo",{
      method:"POST",
      body:JSON.stringify(request),
      headers:{
        'Content-Type': 'application/json'
      }
    }).then(response => response.json()).then((todo)=>{
      dispatch({type: "add-item",item: todo})
      setState({name:""})
      formRef.current.reset()
    })
  }
  const onEdit = (event)=>{
    event.preventDefault();
    const request = {
      name: state.name,
      id: item.id,
      isComplete: item.isCompleted
    }

    fetch(HOST_API+"/todo",{
      method:"PUT",
      body:JSON.stringify(request),
      headers:{
        'Content-Type': 'application/json'
      }
    }).then(response => response.json()).then((todo)=>{
      dispatch({type: "update-item",item: todo})
      setState({name:""})
      formRef.current.reset()
    })
  }
  
  
  return <form ref={formRef}>
  <input type="text" name="name" defaultValue={item.name} onChange={(event)=>{
    setState({...state,name:event.target.value})
  }} ></input>
   {item.id &&<button onClick={onEdit}>Actualizar</button>}
   {!item.id &&<button onClick={onAdd}>Agregar</button>}

  </form>
}

const List = () => {
  const {dispatch,state}= useContext(Store)

  //En este useEffect cargamos los to dos de la base de datos
  useEffect(() => {
    
    fetch(HOST_API+"/todos")
    .then(res => res.json())
    .then((list) => {
      dispatch({type:"update-list",list})
    })
  },[state.list.length,dispatch])

  const onDelete = (id) =>{
    fetch(HOST_API+"/"+id+"/todo",
    {method:"DELETE",
    headers:{
      'Content-Type': 'application/json'
    }},)
    .then((list=>{
      dispatch({type:"delete-item",id})
    }))
  }
  const onEdit = (todo) =>{
    dispatch({type:"edit-item", item:todo})
}

  return <div>
    <table>
      <thead>
        <tr>
          <td>ID</td>
          <td>Nombre</td>
          <td>¿Esta completado?</td>
        </tr>
      </thead>
    </table>
    <tbody>
      {state.list.map((todo)=>{
        return <tr key={todo.id}>
          <td>{todo.id}</td>
          <td>{todo.name}</td>
          <td>{todo.isCompleted === true? "SI" : "NO"}</td>
          <td><button onClick={()=> onDelete(todo.id)}>Eliminar</button></td>
          <td><button onClick={()=> onEdit(todo)}>Editar</button></td>
        </tr>
      })}
    </tbody>
  </div>
}

//Identificamos que tipo de accion se va a hacer, y lo reflejamos en el state
function reducer(state,action){
  switch (action.type) {
    case 'update-item':
      const listUpdateEdit = state.list.map((item)=>{
        if(item.id ===action.item.id){
          return action.item
        }
        return item
      })
      return {...state, list:listUpdateEdit, item: {}}

    case 'delete-item':
      const listUpdate = state.list.filter((item)=>{
        return item.id!== action.id
      })
      return {...state, list:listUpdate}
    case 'update-list':
      return {...state, list:action.list}
    case 'edit-item':
      return {...state,item:action.item}
    case 'add-item':
      const newList = state.list
      newList.push(action.item)
      return {...state,list:newList}
    default:
          return state;
  }
  }

const StoreProvider = ({children})=>{
  const [state, dispatch] = useReducer(reducer, initialState)

return <Store.Provider value={{state, dispatch}}>
  {children}
</Store.Provider>

}

function App() {
  return (
    //Este stire provider nos permite acceder a el state en todos sus componentes internos
    <StoreProvider className="App">
     <Form/>
    <List/>
    </StoreProvider>
  );
}
export default App;
