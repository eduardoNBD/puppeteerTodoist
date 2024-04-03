# puppeteerTodoist

Este proyecto utiliza la librería Puppeteer para automatizar la optencion de un listado de tareas de la url https://trello.com/b/QvHVksDa/personal-work-goals para posteriormente ingresar 5 tareas aleatorias en una cuenta de https://todoist.com.

## Requisitos

- Node.js versión 20.11.1
- npm versión 10.2.4

## Instalación

1. Clona este repositorio en tu máquina local:

```bash
git clone https://github.com/mindinware/puppeteerTodoist.git
cd puppeteerTodoist
npm install
```

## Uso

Una vez que hayas instalado las dependencias, se debe crear un archivo .env a partir del archivo env_sample que viene en la raiz del proyecto
```bash
USERTODOLIST= //Usuario de todoist
PASSWORDTODOLIST=  //Contraseña de todoist
```

Una vez terminado con los pasos anteriores, se puede iniciar el proyecto con el siguiente comando:
```bash
npm run start
```

Este comando ejecutará el script de inicio definido en el archivo package.json