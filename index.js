import {getTasks, loginTodoList} from "./functions.js";

async function init()
{
    if(process.env.USERTODOLIST && process.env.PASSWORDTODOLIST){
        const tasks = await getTasks(); 
        loginTodoList(tasks);
    }
    else 
    {
        console.log("Faltan usuario o contraseña en el archivo .env");
    }
}

init();