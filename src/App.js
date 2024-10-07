import { useState, useEffect } from "react";
import { JsonRpcProvider, Contract, getBigInt, toNumber } from "ethers";
import TodoList from "./artifacts/contracts/TodoList.sol/TodoList.json";
import contractAddressData from "./contract-address.json"



function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);


  console.log("taks", newTask)




  useEffect(() => {
    const initialize = async () => {
      const localProvider = new JsonRpcProvider("http://localhost:8545");
      const code = await localProvider.getCode(contractAddressData.contractAddress);
      console.log("Code at address: ", code);



      console.log(TodoList.abi); 

      try {
        const accounts = await localProvider.listAccounts();
        if (accounts.length === 0) {
          console.log("No accounts found on the local Hardhat network.");
          return;
        }

        const signer = await localProvider.getSigner();

        const contractInstance = new Contract(
          contractAddressData.contractAddress,
          TodoList.abi,
          signer
        );

        // Set contract instance to state
        setContract(contractInstance);
        console.log("Contract instance created:", contractInstance);
        console.log("Connected as:", accounts[0]);
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    };

    initialize();
  }, []); 


//   async function loadTaskCount() {
//     try {
//         const taskCount = await contract.getTaskCountByUser();
//         console.log("Task Count: ", taskCount.toNumber());
//     } catch (error) {
//         console.error("Error fetching task count: ", error.stack || error);
//     }
// }
// loadTaskCount();



const loadTasks = async () => {
  if (contract) {
    try {
      const taskCountBigInt = await contract.getTaskCountByUser();
      const taskCountNumber = toNumber(taskCountBigInt);
      
      console.log("Task count for user:", taskCountNumber);

      let tasksFromBlockchain = [];
      for (let i = 1; i <= taskCountNumber; i++) {
        const task = await contract.getTaskById(i);
        if (task[0].toString() === '0' || task[3] === '0x0000000000000000000000000000000000000000') {
          continue;
        }
        tasksFromBlockchain.push(task);
      }

      setTasks(tasksFromBlockchain);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }
};
  
  

 // Create a new task
const createTask = async () => {
  if (!newTask) {
    console.error("Task content is empty");
    return;
  }

  if (contract) {
    try {
      const tx = await contract.createTask(newTask);
      await tx.wait();
      console.log("Task created successfully:", newTask);
      setNewTask("");  
      loadTasks(); 
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }
};


  // Delete a task
  const deleteTask = async (id) => {
    if (contract) {
      const tx = await contract.deleteTask(id);
      await tx.wait();
      loadTasks();
    }
  };

  return (
    <div>
      <h1>Blockchain To-Do List</h1>
    
        <div>
          <input
            type="text"
            placeholder="New Task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button onClick={createTask}>Add Task</button>
          {/* <ul>
            {tasks.map((task) => (
              console.log("task", task),
              <li key={task.id}>
                {task.content} (Completed: {task.completed ? "Yes" : "No"})
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </li>
            ))}
          </ul> */}
          <ul>
  {tasks.map((task, index) => {
    console.log("task", task); // You can log the task data here for debugging

    return (
      <li key={index}>
        Task ID: {task[0].toString()} {/* Convert BigInt to string */}
        <br />
        Content: {task[1]}
        <br />
        Completed: {task[2] ? "Yes" : "No"}
        <br />
        Owner: {task[3]} {/* Ethereum address */}
        <br />
        <button onClick={() => deleteTask(task[0])}>Delete</button> 
      </li>
    );
  })}
</ul>

        </div>
    </div>
  );
}

export default App;
