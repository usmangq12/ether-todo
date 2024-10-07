// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {
    uint public taskCount = 0;

    struct Task {
        uint id;
        string content;
        bool completed;
        address owner;
    }

    mapping(uint => Task) public tasks;

    event TaskCreated(uint id, string content, address owner);

    event TaskUpdated(uint id, string content, bool completed);

    event TaskDeleted(uint id);    

//    mapping(address => uint) public userTaskCounts;

function createTask(string memory _content) public {
    require(bytes(_content).length > 0, "Task content cannot be empty");
    
    taskCount++;
    tasks[taskCount] = Task(taskCount, _content, false, msg.sender);
    // userTaskCounts[msg.sender]++;
    
    emit TaskCreated(taskCount, _content, msg.sender);
}


function deleteTask(uint _id) public {
    require(tasks[_id].owner == msg.sender, "Only the task owner can delete the task");
    // userTaskCounts[msg.sender]--;
    delete tasks[_id];  // Directly delete the task without using a local variable
    emit TaskDeleted(_id);
}


function getTaskCountByUser() public view returns (uint) {
    // return userTaskCounts[msg.sender];
}

    function updateTask(uint _id, string memory _content, bool _completed) public {
        Task storage task = tasks[_id];

        task.content = _content;
        task.completed = _completed;
        emit TaskUpdated(_id, _content, _completed);
    }

function getTaskById(uint _id) public view returns (uint, string memory, bool, address) {
    Task storage task = tasks[_id];
    return (task.id, task.content, task.completed, task.owner);
}

}
