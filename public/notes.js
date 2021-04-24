const socket = io('http://localhost:5000')
// const socket = io('http://localhost:8800')
const getLastItem = thePath => thePath.substring(thePath.lastIndexOf('/') + 1)



window.onload = ()=>{
    // var create_room = document.getElementById('create_room')
    // var join_room = document.getElementById('join_room')
    var textarea_notes = document.getElementById('textarea_notes')
    var editor = ace.edit("editor");
    var run_script = document.getElementById('run_script')
    
    // if(create_room){
    //     create_room.addEventListener('click', () =>{
    //         console.log('creating new room')
    //         socket.emit('create_new_room')
    //     });
    // }
    // if(join_room){
    //     join_room.addEventListener('click', () =>{
    //         const join_roomId = prompt('Enter Room ID')
    //         // socket.emit('join_room',join_roomId)
    //         window.location.href = `http://localhost:8800/${join_roomId}`
    //     })
        
    // }

    if(textarea_notes){
        editor.setTheme("ace/theme/monokai");
        editor.session.setMode("ace/mode/python");
        socket.emit('create_new_room',getLastItem(window.location.href))
        // socket.emit('join_room',getLastItem(window.location.href))
        textarea_notes.addEventListener('keyup' , () => {
            // setTimeout(() => {
            //     socket.emit('update_notes_for_current_users',textarea_notes.value)
            // }, 1500);
            socket.emit('update_notes_for_current_users',textarea_notes.value,getLastItem(window.location.href))
        })


        editor.textInput.getElement().addEventListener('keyup', () =>{
            socket.emit('update_editor_for_current_users',editor.getValue(),getLastItem(window.location.href))
            // console.log(editor.getValue())
        })

        run_script.addEventListener('click', () =>{
            socket.emit('run_python_script',editor.getValue(),getLastItem(window.location.href))
        })
    }

}











// socket.on('send-roomId', roomId =>{
//     console.log('send-roomId')
//     window.location.href = `http://localhost:8800/${roomId}`
// })


socket.on('update_notes_for_new_users', notes_text =>{
    textarea_notes.value = notes_text;
})

socket.on('update_editor_for_new_users', notes_text =>{
    var editor = ace.edit("editor"); 
    editor.setValue(notes_text,1);
})




socket.on('update_notes_for_current_users',notes_text =>{
    textarea_notes.value = notes_text;
    // console.log(notes_text,'are we here?',textarea_notes.value)
})

socket.on('update_editor_for_current_users',notes_text =>{
    var editor = ace.edit("editor");
    editor.setValue(notes_text,1);
})

socket.on('update_output_for_current_users', result =>{
    const output = document.getElementById('output')
    output.innerHTML = result
})