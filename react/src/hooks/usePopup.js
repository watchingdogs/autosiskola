import * as React from "react"
import Cookies from "universal-cookie"

const cookies = new Cookies()

export const usePopup = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(true)

  const closeModal = () => {
    setIsModalOpen(false)
    cookies.set("popup", "closed", { path: "/", maxAge: 60 * 60 * 1 })
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  React.useEffect(() => {
    if (cookies.get("popup") === "closed") {
      setIsModalOpen(false)
    }
  }, [])

  return { isModalOpen, openModal, closeModal }
}
