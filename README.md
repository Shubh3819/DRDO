This is where I have attached all the codes including the ML models and the UI.
I have already attached the model h5 file and the pkl file in the Backend folder,Save them in the same folder as your app.py file just like the Backend folder.
Install all the dependencies and run python app.py in the terminal of the backend folder.

Now for the frontend Save all the Frontend folder.
Open a seperate terminal for the frontend while the backend terminal runs.
type npm i for installing all the dependencies.
after installing type "npm run dev"
Your code should work on a local web host.

#-----------ABOUT THE CODE------------------#
The model was made on collab notebook and the model and pkl file was saved.
The model and pkl file was then loaded and used through flask.
The flask connected the backend(written in python) to the Frontend which was made in Reactjs
In the web page u drop your audio file,the model processes the file and classifies the type of audio data sent.
