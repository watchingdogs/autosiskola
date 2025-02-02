const defaultButtonStyle = {
  position: "absolute",
  right: "10px",
  zIndex: "1000",
  backgroundColor: "#202632",
  color: "white",
  borderRadius: "5px",
  border: "none",
  fontSize: "1.5em",
  cursor: "pointer",
}

export function Navigation(props) {
  const { openModal, showCategories, isSidebarOpen, setIsSidebarOpen } = props

  return (
    <>
      <button
        id="sidebar-button"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{
          ...defaultButtonStyle,
          top: "10px",
        }}
      >
        Menü
      </button>
      <button
        onClick={showCategories}
        style={{
          ...defaultButtonStyle,
          top: "50px",
        }}
      >
        Kategóriák
      </button>
      <button
        onClick={openModal}
        style={{
          ...defaultButtonStyle,
          top: "90px",
        }}
      >
        Súgó
      </button>
    </>
  )
}
