import React, { useState, useEffect } from "react";

const AddSongModal = ({ onClose, onSelectFile, onSelectDatabaseSong }) => {
  const [showList, setShowList] = useState(false);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    if (showList) {
      fetch("http://localhost:5000/api/songs")
        .then((res) => res.json())
        .then((data) => setSongs(data))
        .catch((err) => console.error("Error fetching songs:", err));
    }
  }, [showList]);

  return (
    <div style={styles.modal}>
      <h3 style={{ color: "#fff" }}>Add Song</h3>

      {!showList ? (
        <div style={styles.optionButtons}>
          <button onClick={() => document.getElementById("fileInput").click()}>
            📁 Upload from Computer
          </button>
          <input
            id="fileInput"
            type="file"
            accept="audio/*"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files.length > 0) {
                onSelectFile(e.target.files[0]);
                onClose();
              }
            }}
          />
          <button onClick={() => setShowList(true)}>🎵 Choose from List</button>
        </div>
      ) : (
        <div style={styles.songList}>
          {songs.map((song) => (
            <button
              key={song.id}
              onClick={() => {
                onSelectDatabaseSong(song);
                onClose();
              }}
            >
              {song.name}
            </button>
          ))}
        </div>
      )}

      <button onClick={onClose} style={styles.closeBtn}>
        Close
      </button>
    </div>
  );
};

const styles = {
  modal: {
    position: "absolute",
    top: "20%",
    left: "35%",
    padding: "20px",
    background: "#1e1e1e",
    borderRadius: "10px",
    color: "#fff",
    zIndex: 100,
    boxShadow: "0 0 10px #000",
  },
  optionButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  songList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "10px",
  },
  closeBtn: {
    marginTop: "15px",
    backgroundColor: "#444",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default AddSongModal;
