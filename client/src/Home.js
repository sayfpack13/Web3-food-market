import { useContext, useEffect } from "react"
import { LoadingContext } from "."


export default function Home() {
  const { isLoading, setisLoading } = useContext(LoadingContext)

  useEffect(() => {
    setTimeout(()=>{
      setisLoading(false)
    },500)
  },[isLoading])

  

  return (
    <>

    </>
  )
}