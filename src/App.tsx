import './App.css'
import Table, { arrayData } from './components/Table'

interface DataType {
  name: string
  value: number
  b: boolean
  id: number
}
const data = Array.from(Array(111).keys()).map((i) => ({
  name: `${i} entry`,
  value: i * Math.random(),
  id: i,
  b: i % 3 === 0
}))
function App() {

  return (
    <>
      before
      <Table className="table" getData={arrayData(data)} rows={10} columns={[
        { field: 'name', name: 'name' },
        { field: 'name', name: 'namex' },
        { field: 'name', name: 'namee' },
        { field: 'name', name: 'namew' },
        { field: 'name', name: 'nameq' },
        { field: 'name', name: 'namef' },
        { field: 'name', name: 'named' },
        { field: 'name', name: 'names' },
        { field: 'name', name: 'namea' },
      ]} />
      after
    </>
  )
}

export default App
