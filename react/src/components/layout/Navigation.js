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
  const { showCategories, isSidebarOpen, setIsSidebarOpen } = props

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
    </>
  )
}
/* Removed the following code from react/src/components/layout/Navigation.js, functionality temporarily disabled (but not removed):
<button
onClick={showCategories}
style={{
  ...defaultButtonStyle,
  top: "50px",
}}
>
Kategóriák
</button>
*/