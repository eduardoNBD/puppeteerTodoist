import {getTasks, loginTodoList} from "./functions.js";

async function init()
{
    const tasks = await getTasks(); 
    loginTodoList(tasks);
}

init();