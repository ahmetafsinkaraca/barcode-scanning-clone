import { useEffect, useRef, useState } from "react";

function App() {

  const video = useRef(null);
  const canvas = useRef(null);
  const [barcode, setBarCode] = useState(null);
  const [basket, setBasket] = useState([]);

  const openCam = () => {
    navigator.mediaDevices.getUserMedia({
      video: {
        width:300,
        height:300,
        facingMode: 'environment' // mobilde arka kamerayı açtırmak için
      }
    })
    .then(stream => {
      video.current.srcObject = stream;
      video.current.play();

      const ctx = canvas.current.getContext('2d');
      const barcode = new window.barcodeDetector({formats: ['or_code', 'ean_13']});
      setInterval(() => {
        canvas.current.width = video.current.videoWidth;
        canvas.current.height = video.current.videoHeight;
        ctx.drawImage(video.current, 0, 0, video.current.videoWidth, video.current.videoHeight);
        barcode.detect(canvas.current)
        .then(([data]) => {
          if(data) {
            setBarCode(data.rawValue);
          }
        })
        .catch(err => console.log(err))
      }, 100)

    })
    .catch(err => alert(err))
  }

  useEffect(() => {
    if(barcode) {

      // kendinize uygun şekilde endpointi değiştirip kullanın
      const API_URL = `http://localhost/api.php?barcode=${barcode}`

      fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if(data) {
          setBasket([...basket, data]);
        } else {
          alert('Bu ürün bulunamdı')
        }
      })
    }
  }, [barcode])

  return (
    <div className="App">
      <button onClick={openCam}>kamerayı Aç</button>
      <div>
        <video ref={video} autoPlay muted hidden></video>
        <canvas ref={canvas}></canvas>
      </div>
      {barcode && (
        <div>
          Bulunan barkod: {barcode}
        </div>
      )}
      {basket && basket.map(item => (
        <div key={item.id}>
          {item.product}<br/>
          {item.price}<br/>
          <img src={item.image} style={{width: 100, height: 100}}/>
        </div>
      ))}
    </div>
  );
}

export default App;
