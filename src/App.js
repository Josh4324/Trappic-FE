/* eslint-disable import/no-webpack-loader-syntax */
import "./app.css";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from "react-map-gl";
import { useEffect, useState, useRef } from "react";
import { Room, Star, StarBorder, Cancel } from "@material-ui/icons";
import axios from "axios";
import { format } from "timeago.js";
import GeocoderControl from "./components/Geocoder";
import Register from "./components/Register";
import Login from "./components/Login";
import { v4 as uuidv4 } from "uuid";
import mapboxgl from "mapbox-gl";

function App() {
  // eslint-disable-next-line import/no-webpack-loader-syntax
  mapboxgl.workerClass =
    require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;
  const myStorage = window.localStorage;
  const [currentUsername, setCurrentUsername] = useState(
    myStorage.getItem("user")
  );
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [place, setPlace] = useState(null);
  const [link, setLink] = useState(null);
  const [price, setPrice] = useState(null);
  const [desc, setDesc] = useState(null);
  const [star, setStar] = useState(0);
  const [check, setCheckList] = useState({});
  const [picture, setPicture] = useState("");
  const [current, setCurrent] = useState("");
  const [viewport, setViewport] = useState({
    latitude: 6.5295306,
    longitude: 3.2934887,
    zoom: 10,
  });

  const addCheck = (id, price) => {
    const total = myStorage.getItem("total");
    const places = myStorage.getItem("places");

    if (total === null) {
      myStorage.setItem("total", price);
    } else {
      const full = Number(total) + Number(price);
      myStorage.setItem("total", full);
    }

    if (places == null) {
      myStorage.setItem("places", JSON.stringify([id]));
    } else {
      const place = JSON.parse(places);
      place.push(id);
      myStorage.setItem("places", JSON.stringify(place));
    }

    setCurrent(uuidv4());
  };

  const removeCheck = (id, price) => {
    const total = myStorage.getItem("total");
    const places = myStorage.getItem("places");

    if (total === null) {
      myStorage.setItem("total", price);
    } else {
      const full = Number(total) - Number(price);
      myStorage.setItem("total", full);
    }

    if (places == null) {
      myStorage.setItem("places", JSON.stringify([id]));
    } else {
      const place = JSON.parse(places);
      const result = place.filter((item) => item !== id);
      myStorage.setItem("places", JSON.stringify(result));
    }

    setCurrent(uuidv4());
  };

  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const imageRef = useRef();

  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewport({ ...viewport, latitude: lat, longitude: long });
  };

  const handleAddClick = (e) => {
    console.log(e.lngLat.lng, e.lngLat.lat);
    const lng = e.lngLat.lng;
    const lat = e.lngLat.lat;
    setPicture("");

    setNewPlace({
      lat,
      long: lng,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUsername,
      image: picture,
      place,
      price,
      link,
      desc,
      rating: star,
      lat: newPlace.lat,
      long: newPlace.long,
    };

    try {
      const res = await axios.post(
        "https://attendanceapp.bakerindustries.io/trappic/api/pins",
        newPin
      );
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleImage = async (e) => {
    e.preventDefault();
    let formData = new FormData();
    const file = imageRef.current.files[0];
    formData.append("picture", file);

    try {
      setPicture("loading");
      const res = await axios.patch(
        "https://attendanceapp.bakerindustries.io/trappic/api/pins/image",
        formData
      );
      console.log(res.data.picture);
      setPicture(res.data.picture);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const getPins = async () => {
      try {
        const allPins = await axios.get(
          "https://attendanceapp.bakerindustries.io/trappic/api/pins"
        );
        setPins(allPins.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);

  const handleLogout = () => {
    setCurrentUsername(null);
    myStorage.removeItem("user");
    myStorage.removeItem("total");
    myStorage.removeItem("places");
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Map
        initialViewState={{
          latitude: 6.5295306,
          longitude: 3.2934887,
          zoom: 12,
          bearing: 0,
          pitch: 0,
        }}
        mapboxAccessToken="pk.eyJ1Ijoiam9zaDQzMjQiLCJhIjoiY2tiemoyYmN2MGJ6ODJ2bXJmM25pbjN1dSJ9.veWU3GwQOzzf0OSAA_TRNg"
        width="100%"
        height="100%"
        transitionDuration="200"
        mapStyle="mapbox://styles/mapbox/streets-v9"
        onViewportChange={(viewport) => setViewport(viewport)}
        onDblClick={currentUsername && handleAddClick}
      >
        <GeocoderControl
          mapboxAccessToken="pk.eyJ1Ijoiam9zaDQzMjQiLCJhIjoiY2tiemoyYmN2MGJ6ODJ2bXJmM25pbjN1dSJ9.veWU3GwQOzzf0OSAA_TRNg"
          position="top-left"
        />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />
        {pins.map((p) => (
          <>
            <Marker
              latitude={p.lat}
              longitude={p.long}
              offsetLeft={-3.5 * viewport.zoom}
              offsetTop={-7 * viewport.zoom}
            >
              <Room
                style={{
                  fontSize: 7 * viewport.zoom,
                  color:
                    currentUsername === p.username ? "tomato" : "slateblue",
                  cursor: "pointer",
                }}
                onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
              />
            </Marker>
            {p._id === currentPlaceId && (
              <Popup
                key={p._id}
                latitude={p.lat}
                longitude={p.long}
                closeButton={true}
                closeOnClick={false}
                onClose={() => setCurrentPlaceId(null)}
                anchor="left"
              >
                <div className="card">
                  <label>Place</label>
                  <h4 className="place">{p.place}</h4>
                  {p.image.length > 0 ? <img src={p.image} alt="place" /> : ""}

                  <label>Website | Link</label>
                  <h4 className="place">
                    <a href={`${p.link}`} target="_blank" rel="noreferrer">
                      {p.link}
                    </a>
                  </h4>
                  <label>Review</label>
                  <p className="desc">{p.desc}</p>
                  <label>Rating</label>
                  <div className="stars">
                    {Array(p.rating).fill(<Star className="star" />)}
                  </div>
                  <label>Information</label>
                  <span className="username">
                    Created by <b>{p.username}</b>
                  </span>
                  <span className="date">{format(p.createdAt)}</span>
                  {JSON.parse(myStorage.getItem("places"))?.includes(p._id) ? (
                    <button
                      onClick={() => {
                        removeCheck(p._id, p.price);
                      }}
                    >
                      Remove from checkout
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        addCheck(p._id, p.price);
                      }}
                    >
                      Add to checkout
                    </button>
                  )}
                </div>
              </Popup>
            )}
          </>
        ))}
        {newPlace && (
          <>
            <Marker
              latitude={newPlace.lat}
              longitude={newPlace.long}
              offsetLeft={-3.5 * viewport.zoom}
              offsetTop={-7 * viewport.zoom}
            >
              <Room
                style={{
                  fontSize: 7 * viewport.zoom,
                  color: "tomato",
                  cursor: "pointer",
                }}
              />
            </Marker>
            <Popup
              latitude={newPlace.lat}
              longitude={newPlace.long}
              closeButton={true}
              closeOnClick={false}
              onClose={() => setNewPlace(null)}
              anchor="left"
            >
              <div>
                <form onSubmit={handleSubmit}>
                  <label>Place</label>
                  <input
                    placeholder="Enter the name of the place"
                    required
                    autoFocus
                    onChange={(e) => setPlace(e.target.value)}
                    className="input"
                  />

                  <label>Experience</label>
                  <textarea
                    placeholder="Say us something about this place."
                    onChange={(e) => setDesc(e.target.value)}
                    className="input"
                    required
                  />
                  <label>Picture</label>
                  <input
                    className="input"
                    type="file"
                    onChange={handleImage}
                    ref={imageRef}
                    accept="image/*"
                  />
                  {picture === "loading" ? (
                    "loading"
                  ) : picture.length > 0 ? (
                    <img className="image" src={picture} alt="img" />
                  ) : null}
                  <label>Rating</label>
                  <select
                    required
                    className="input"
                    onChange={(e) => setStar(e.target.value)}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                  <label>Website | Link</label>
                  <input
                    placeholder="Enter the website url or link"
                    onChange={(e) => setLink(e.target.value)}
                    className="input"
                  />
                  <label>Cost</label>
                  <input
                    type="number"
                    required
                    placeholder="Enter the location entrance fee"
                    onChange={(e) => setPrice(e.target.value)}
                    className="input"
                  />
                  <button type="submit" className="submitButton">
                    Add Pin
                  </button>
                </form>
              </div>
            </Popup>
          </>
        )}
        {currentUsername ? (
          <div
            style={{
              position: "absolute",
              backgroundColor: "white",
              width: "100px",
              padding: "5px",
              top: "10px",
              right: "150px",
            }}
          >
            Total Cost : {myStorage.getItem("total")}
          </div>
        ) : (
          ""
        )}

        {currentUsername ? (
          <button className="button logout" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <div className="buttons">
            <button
              className="button login"
              onClick={() => {
                setShowLogin(true);
                setShowRegister(false);
              }}
            >
              Log in
            </button>
            <button
              className="button register"
              onClick={() => {
                setShowRegister(true);
                setShowLogin(false);
              }}
            >
              Register
            </button>
          </div>
        )}
        {showRegister && <Register setShowRegister={setShowRegister} />}
        {showLogin && (
          <Login
            setShowLogin={setShowLogin}
            setCurrentUsername={setCurrentUsername}
            myStorage={myStorage}
          />
        )}
      </Map>
    </div>
  );
}

export default App;
