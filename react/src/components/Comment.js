import React from "react";
import PocketBase from 'pocketbase'
import { COLORS } from "../helpers/constants";

function CommentBox({ id }) {

  const pb = new PocketBase('https://autosiskola.mikulalajos.hu')
  pb.autoCancellation(false);


  const [comments, setComments] = React.useState([])

    React.useEffect(() => {
        console.log('id', id)
        pb.collection('comments').getFullList({
            sort: '-created'
        }).then((data) => {
            var idString = id.toString()
            var goodComments = []
            for (var i = 0; i < data.length; i++) {
                console.log('data[i]', data[i].azon, idString)
                if (data[i].azon === idString) {
                    goodComments.push(data[i])
                }
            }
            console.log('data', goodComments)
            setComments(goodComments)
        })  
    }, [])

  return (
    <div className="comment-box">
      <h1>Vélemények</h1>
      <div style={{marginLeft: '10px'}}>
      <p style={{ color: "red", fontWeight: "bold",margin: 0, marginBottom: 2 }}>Minden megjegyzés nyilvános!</p>
      <input type="text" placeholder="Név" id="uname" />
      <textarea placeholder="Vélemény" id="comment" style={{ marginTop: '5px' }}></textarea>
      <br />
      <button onClick={() => {
            var uname = document.getElementById('uname').value
            var comment = document.getElementById('comment').value
            if (comment === '' || uname === '' || comment.length < 3) {
                alert('Nem lehet üres mező')
                return
            }
            pb.collection('comments').create({
                azon: id.toString(),
                uname: uname,
                comment: comment
            }).then(() => {
                alert('Sikeres hozzáadás')
                document.getElementById('uname').value = ''
                document.getElementById('comment').value = ''
            })
        }}>Hozzáad</button>
        </div>
        <div>
            {
                comments.map((comment) => (
                    <div key={comment.id} className="comment" style={{border: '1px solid black', padding: '5px', margin: '10px'}}>
                        <p style={{margin: '0px'}}><strong>{comment.uname}</strong> írta</p>
                        <p style={{margin: '0px'}}>{comment.comment}</p>
                        <p style={{margin: '0px'}}>({new Date(comment.created).toDateString()})</p>
                    </div>
                ))
            }
        
        </div>
    </div>
  );
}

export default CommentBox;