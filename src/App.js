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

  //Peticion para editar un to do 
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
    <div className="form-group ">
    <input type="text" name="name"  defaultValue={item.name} onChange={(event)=>{
    setState({...state,name:event.target.value})
  }} ></input>
   {item.id &&<button type="button" className="btn btn-primary" onClick={onEdit}>Actualizar</button>}
   {!item.id &&<button type="button" className="btn btn-info" onClick={onAdd}>Agregar</button>}


    </div>
  
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

  //Metodo delete para borrar un to do de la basede datos
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

const onChangeComplete = (todo) =>{ 
  
    todo.isCompleted= !todo.isCompleted
    const request = {
      name: todo.name,
      id: todo.id,
      completed: true
    }

    fetch(HOST_API+"/todo",{
      method:"PUT",
      body:JSON.stringify(request),
      headers:{
        'Content-Type': 'application/json'
      }
    }).then(response => response.json()).then((todo)=>{
      console.log(todo);
      dispatch({type:"edit-item-completed", item:todo})
    })
 
}

  return <div>
    <table className="table">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Nombre</th>
          <th scope="col">¿Esta completado?</th>
          <th scope="col">Eliminar</th>
          <th scope="col">Editar</th>
          <th scope="col">Completar</th>


        </tr>
      </thead>
    <tbody>
      {state.list.map((todo)=>{
        return <tr key={todo.id} >
          
          <td >{todo.id}</td>
          <td>{todo.name}</td>
          <td>{todo.isCompleted === true? "SI" : "NO"}</td>
          <td><button type="button" className="btn btn-danger" onClick={()=> onDelete(todo.id)}>Eliminar</button></td>
          <td><button  type="button" className="btn btn-success" onClick={()=> onEdit(todo)}>Editar</button></td>
          <td><button type="button" className="btn btn-info" onClick={()=> onChangeComplete(todo)}>Completado</button></td>

        </tr>
      })}
    </tbody>
    </table>

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
    case 'edit-item-completed':
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
