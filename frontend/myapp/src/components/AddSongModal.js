import React, { useState, useEffect } from "react";

const AddSongModal = ({ onClose, onSelectFile, onSelectDatabaseSong }) => {
  const [showList, setShowList] = useState(false);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (showList) {
      setLoading(true);
      fetch("http://localhost:5000/api/songs")
        .then((res) => res.json())
        .then((data) => {
          setSongs(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching songs:", err);
          setLoading(false);
        });
    }
  }, [showList]);

  // Filter songs based on search term
  const filteredSongs = songs.filter(song => 
    song.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={styles.title}>ADD TRACK</h3>
          <button onClick={onClose} style={styles.closeIcon}>×</button>
        </div>

        {!showList ? (
          <div style={styles.optionsContainer}>
            <button 
              style={styles.optionButton} 
              onClick={() => document.getElementById("fileInput").click()}
            >
              <div style={styles.optionIcon}>📁</div>
              <div style={styles.optionText}>
                <span style={styles.optionTitle}>Upload Track</span>
                <span style={styles.optionDescription}>From your computer</span>
              </div>
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
            
            <button 
              style={styles.optionButton}
              onClick={() => setShowList(true)}
            >
              <div style={styles.optionIcon}>🎵</div>
              <div style={styles.optionText}>
                <span style={styles.optionTitle}>Track Library</span>
                <span style={styles.optionDescription}>Choose from database</span>
              </div>
            </button>
          </div>
        ) : (
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
                setShowList(false);
                setSearchTerm("");
              }}
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    width: "400px",
    background: "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)",
    borderRadius: "8px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
    color: "#fff",
    overflow: "hidden",
    border: "1px solid #333",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 15px",
    borderBottom: "1px solid #333",
    backgroundColor: "#222",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "#fff",
    letterSpacing: "1px",
  },
  closeIcon: {
    background: "none",
    border: "none",
    color: "#999",
    fontSize: "24px",
    cursor: "pointer",
    padding: "0 5px",
  },
  optionsContainer: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  optionButton: {
    display: "flex",
    alignItems: "center",
    background: "linear-gradient(180deg, #2d2d2d 0%, #222 100%)",
    border: "1px solid #444",
    borderRadius: "6px",
    padding: "15px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  optionIcon: {
    fontSize: "24px",
    marginRight: "15px",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#333",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    flex: 1,
  },
  optionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "4px",
  },
  optionDescription: {
    fontSize: "14px",
    color: "#999",
  },
  songLibraryContainer: {
    display: "flex",
    flexDirection: "column",
    height: "400px",
  },
  searchContainer: {
    padding: "15px",
    borderBottom: "1px solid #333",
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
    border: "none",
    padding: "10px",
    cursor: "pointer",
    borderTop: "1px solid #444",
    fontWeight: "500",
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

export default AddSongModal;