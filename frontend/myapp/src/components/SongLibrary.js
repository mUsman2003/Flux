import React, { useState, useEffect } from "react";

const SongLibrary = ({ onSelectDatabaseSong, onClose, goBack }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
  setLoading(true);
  fetch("http://flux.local:31500/api/songs")  // Matches backend NodePort
    .then((res) => res.json())
    .then((data) => {
      setSongs(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching songs:", err);
      setLoading(false);
    });
}, []);


  // Filter songs based on search term
  const filteredSongs = songs.filter((song) =>
    song.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.songLibraryContainer}>
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search tracks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.songList}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <span>Loading tracks...</span>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div style={styles.noResults}>No tracks found</div>
        ) : (
          filteredSongs.map((song) => (
            <button
              key={song.id}
              style={styles.songItem}
              onClick={() => {
                onSelectDatabaseSong(song);
                onClose();
              }}
            >
              <span style={styles.songName}>{song.name}</span>
              <span style={styles.loadIcon}>▶</span>
            </button>
          ))
        )}
      </div>

      <button
        style={styles.backButton}
        onClick={() => {
          goBack();
          setSearchTerm("");
        }}
      >
        ← Back
      </button>
    </div>
  );
};

const styles = {
  songLibraryContainer: {
    display: "flex",
    flexDirection: "column",
    height: "500px",
    alignItems: "center", // This will center child elements horizontally
  },
  searchContainer: {
    padding: "10px",
    borderBottom: "1px solid #333",
    width: "80%", // Add some width so it's not full width
    alignItems: "center",
  },
  searchInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #444",
    backgroundColor: "#333",
    color: "#fff",
    fontSize: "14px",
  },
  songList: {
    flex: 1,
    overflowY: "auto",
    padding: "10px",
  },
  songItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "12px 15px",
    marginBottom: "6px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2a2a2a",
    color: "#fff",
    textAlign: "left",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  songName: {
    fontSize: "14px",
    fontWeight: "500",
  },
  loadIcon: {
    fontSize: "12px",
    color: "#4095e5",
  },
  backButton: {
    backgroundColor: "#333",
    color: "#fff",
    border: "2px",
    padding: "10px",
    cursor: "pointer",
    borderTop: "1px solid #444",
    fontWeight: "500",
    borderRadius: "10%",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
    color: "#999",
  },
  loadingSpinner: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border: "3px solid #444",
    borderTopColor: "#4095e5",
    animation: "spin 1s linear infinite",
    marginBottom: "10px",
  },
  noResults: {
    padding: "20px",
    textAlign: "center",
    color: "#999",
  },
};

export default SongLibrary;