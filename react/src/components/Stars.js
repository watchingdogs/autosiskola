import React from "react";
import PocketBase from 'pocketbase'
import { COLORS } from "../helpers/constants";
import { Form, Button } from "react-bootstrap";

function Stars({ id }) {

  const pb = new PocketBase('https://autosiskola.mikulalajos.hu')
  pb.autoCancellation(false);


  const [stars, setStars] = React.useState([])

    React.useEffect(() => {
        var goodStars = []
        console.log('id', id)
        pb.collection('stars').getFullList({
            sort: '-created'
        }).then((data) => {
            for (var i = 0; i < data.length; i++) {
                console.log('data[i]', data[i].azon, id)
                if (data[i].azon === id.toString()) {
                    goodStars.push(data[i])
                }
            }
            console.log('data', data)

            setStars(goodStars)
        })  
    }, [])

  return (
    <div className="comment-box">
      <h1>Vélemények</h1>
      {
            stars.length === 0 ? <p>Nincsenek értékelések</p> : <p>{(stars.map((star) => star.stars).reduce((a, b) => parseInt(a) + parseInt(b)) / stars.length).toFixed(1)} pont átlagban</p>
      }
      <div style={{marginLeft: '10px'}}>
      <Form.Group style={{marginTop: '5px', display: 'flex', flexDirection: 'row'}}>
        <Form.Label style={{marginRight: '10px', color: "black", marginTop: "4px", marginRight: "3px"}}>1</Form.Label>
        <Form.Check type="radio" name="rating" value="1" style={{marginRight: '15px'}} />
        <Form.Label style={{marginRight: '10px', color: "black", marginTop: "4px", marginRight: "3px"}}>2</Form.Label>
        <Form.Check type="radio" name="rating" value="2" style={{marginRight: '15px'}} />
        <Form.Label style={{marginRight: '10px', color: "black", marginTop: "4px", marginRight: "3px"}}>3</Form.Label>
        <Form.Check type="radio" name="rating" value="3" style={{marginRight: '15px'}} />
        <Form.Label style={{marginRight: '10px', color: "black", marginTop: "4px", marginRight: "3px"}}>4</Form.Label>
        <Form.Check type="radio" name="rating" value="4" style={{marginRight: '15px'}}/>
        <Form.Label style={{marginRight: '10px', color: "black", marginTop: "4px", marginRight: "3px"}}>5</Form.Label>
        <Form.Check type="radio" name="rating" value="5" style={{marginRight: '15px'}} />
      </Form.Group>
      <br />
      <Button onClick={() => {
            var stars = document.querySelector('input[name="rating"]:checked')
            if (!stars) {
                alert('Nem lehet üres mező')
                return
            }
            pb.collection('stars').create({
                azon: id.toString(),
                stars: stars.value
            }).then(() => {
                alert('Sikeres hozzáadás')
            }).catch((err) => {
                alert('Hiba történt, próbáld újra')
            })
        }}>Hozzáad</Button>
        </div>
    </div>
  );
}

export default Stars;