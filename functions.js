import puppeteer from 'puppeteer'
import fs from "fs/promises"; 

export async function getTasks(){
    console.log("\x1b[33m","Init get Tasks");
    const browser = await puppeteer.launch({
        headless: false,  
    })

    const context = await browser.createBrowserContext();
    
    const page = await context.newPage();
    
    page.on('dialog', (dialog) => { 
        dialog.accept(); 
    });

    await page.goto("https://trello.com/b/QvHVksDa/personal-work-goals", { waitUntil: 'networkidle0' });
    
    await Promise.all([
        await page.click("[class='oVcaxVSv1L1Ynk bxgKMAm3lq5BpA SdamsUKjxSBwGb SEj5vUdI3VvxDc']")
    ]);
     
    const urls = await page.evaluate(() => {
        const tasks = document.querySelectorAll('#board [data-testid="list-card"]');
        const data  = [...tasks].map((task) => {
            const link = task.querySelector("div a").href; 
            return link;
        });

        return data;
    });

    const allData = [];

    for (const url of urls) 
    {
        await page.goto(url, { waitUntil: 'networkidle0' });
        await page.click("[class='oVcaxVSv1L1Ynk bxgKMAm3lq5BpA SdamsUKjxSBwGb SEj5vUdI3VvxDc']");
        const info =  await page.evaluate(() => {
            var title = document.querySelector(".mod-card-back-title.js-card-detail-title-input").value;
            var tags = document.querySelector("[data-testid='card-label']") ? document.querySelector("[data-testid='card-label']").innerHTML : "";
            var desc = document.querySelector('[attr="desc"] p') ? document.querySelector('[attr="desc"] p').innerHTML : "";
            var checks = [];
            var allChecks = document.querySelectorAll('.checklist-item');
            
            allChecks.forEach(check => 
            { 
                checks.push(check.querySelector(".checklist-item-details-text").innerHTML);
            });

            return {
                title,
                tags,
                desc,
                checks
            };
        });
        
        allData.push(info);
   }

   await browser.close();
   
   await fs.writeFile("tasks.json", JSON.stringify(allData));
   
   console.log("\x1b[33m","End get Tasks");

   return allData;
}

export async function loginTodoList(tasks){ 
    
    console.log("\x1b[33m","Login Todoist");

    const browser = await puppeteer.launch({headless: false, slowMo: 100});

    const context = await browser.createBrowserContext();
     
    const page = await context.newPage();
    
    page.on('dialog', (dialog) => { 
        if(dialog.message() != "Error al inicio de sesión")
        {
            dialog.accept(); 
        }

    });

    await page.goto("https://app.todoist.com/auth/login", { waitUntil: 'networkidle0' });
    await page.type('#element-0', process.env.USERTODOLIST);
    await page.type('#element-3', process.env.PASSWORDTODOLIST);

    await Promise.all([
        page.click('.rWfXb_e'), 
    ]);
    
    let wronMessage = false;

    try 
    {
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10002 });
    } 
    catch (error) 
    {
        wronMessage = await page.evaluate(() => {
            const error = document.querySelector('.a83bd4e0._266d6623._8f5b5f2b.fb8d74bb');
            return error ? true : false;
        });
    }
        
    wronMessage = await page.evaluate(() => {
        const error = document.querySelector('.a83bd4e0._266d6623._8f5b5f2b.fb8d74bb');
        return error ? true : false;
    });
     
    if(wronMessage)
    {
        console.log("\x1b[33m","Error al inicio de sesión en todoist.com");

        await page.evaluate(() => {
            alert("Error al inicio de sesión");
        });
        
        await browser.close();
    }
    else
    {
        
        console.log("\x1b[33m","Begin Register Tasks");

        const tasksIndex = getRandomIndex(tasks.length,5);
        console.log(tasksIndex);
        try{
            await page.waitForSelector('[data-testid="app-sidebar-container"] .fb8d74bb._14423c92._297575f4.c4a9b3ab._5f8879d9 button');
        }
        catch(error)
        {
            await browser.close();
            loginTodoList(tasks);
        }

        for await (const index of tasksIndex) 
        { 
            console.log("new task");
           
            await page.waitForSelector('[data-testid="app-sidebar-container"] .fb8d74bb._14423c92._297575f4.c4a9b3ab._5f8879d9 button')
            
            await page.evaluate(() => {
                const button = document.querySelectorAll('[data-testid="app-sidebar-container"] .fb8d74bb._14423c92._297575f4.c4a9b3ab._5f8879d9 button');
                 
                button[2].click();
            });

            await page.waitForSelector(".quick_add");

            let title = tasks[index].title;

            if(tasks[index].tags != '')
            {
                title+= " @"+tasks[index].tags.replaceAll(" ","_");
            }
             
            await page.type(".quick_add .task_editor__content_field .tiptap",title);

            if(tasks[index].tags != '')
            {
                await page.keyboard.press("Tab");
            }
            
            if(tasks[index].desc != "")
            {
                await page.type(".quick_add .task_editor__description_field .tiptap",tasks[index].desc);
            }
             
            
            await page.evaluate(() => {
                const button = document.querySelectorAll('.quick_add [data-testid="task-editor-submit-button"]');
                
                button[0].click(); 
            });

            if(tasks[index].checks.length > 0)
            {
                await page.click('[data-testid="toasts-container"] ._8313bd46._907a61ca._8b7f1a82.fb8d74bb._56a651f6');
                
                let existTask = false;

                await page.waitForSelector('[data-testid="task-main-content-container"] .XWTk3kx.fb8d74bb._14423c92._5f8879d9 button');

                for await (const check of tasks[index].checks) 
                {
                    if(!existTask)
                    {
                        await page.click('[data-testid="task-main-content-container"] .XWTk3kx.fb8d74bb._14423c92._5f8879d9 button');
                    }
                    else
                    {
                        await page.click("[data-testid='modal-overlay'] [class='plus_add_button"); 
                    }

                    await page.type(".task_editor__content_field .tiptap",check);
                    await page.click('.task_editor__footer__action-buttons [data-testid="task-editor-submit-button"]');
                    existTask = true;
                }

                await page.evaluate(() => {
                    const buttons = document.querySelectorAll('.fb8d74bb._14423c92._5f8879d9 .fb8d74bb.f53218d5 ._8313bd46.f169a390._5e45d59f._8644eccb.fb8d74bb');
                    if(buttons[1]){
                        buttons[1].click();
                    }
                });
            }
            else
            {

            } 
            
        }
        console.log("End Register task")
        await browser.close();
    }
}

function getRandomIndex(max, length)
{
    let arrTemp = Array.from(
        { length: length },
        () =>  Math.floor(Math.random() * ((max-1) - 0 + 1)) + 0);
    
    let arrayFinal = [];
     
    arrTemp.forEach((ele) => {
        if(arrayFinal.includes(ele)){
            ele = 0;
    
            while(arrayFinal.includes(ele) && ele < max){
                ele++;
            } 
    
            arrayFinal.push(ele);
        }
        else{
            arrayFinal.push(ele);
        }
    });
    
    return arrayFinal;
}