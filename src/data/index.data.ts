import { APIData } from "src/types/index.dto"
import Companies from "./companies"
import Icecream from "./icecream"
import Mobile from "./mobiles"


const data: {[key: string]: APIData[] } = {
  Companies,
  Icecream,
  Mobile
}

export default data
