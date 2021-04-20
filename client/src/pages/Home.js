import { Navbar, Suggested, Post } from '../components'
import '../index.css'
import Cards from '../components/grams/Cards'

const Home = () => {
  return (
    <>
      <Navbar />
      <div className="cols">

      </div>
      <div className="cols">
        <Cards />

      </div>
      <div className="cols col3">
        <Suggested />
      </div>
    </>

  )
}

export default Home