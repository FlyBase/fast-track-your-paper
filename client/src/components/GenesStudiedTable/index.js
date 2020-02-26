import React from 'react'
import GeneStudiedRow from 'components/GenesStudiedRow'

import './index.css'

// import { useStateFromProp } from 'hooks/useStateFromProp'

//TODO: Remove when API is in place.
const initGenes = [
  {
    id: 'FBgn0000490',
    symbol: 'dpp',
    synonyms: ['dpp', 'DPP', 'BMP'],
    antibody: 'none',
  },
  {
    id: 'FBgn0013765',
    symbol: 'cnn',
    synonyms: ['CNN', 'centrosomin', 'blah'],
    antibody: 'monoclonal',
  },
  {
    id: 'FBgn12345',
    symbol: '18w',
    synonyms: ['18 wheeler', '18W', 'hello'],
    antibody: 'polyclonal',
  },
]

const GenesStudiedTable = ({ showAbs = false, genes = initGenes }) => {
  let abcell = showAbs ? '' : 'abcell'

  return (
    <table className="table table-striped table-bordered table-hover table-condensed">
      <thead>
        <tr>
          <th>Genes studied in this publication</th>
        </tr>
        <tr className="info">
          <th>Gene</th>
          <td className={abcell}>
            no
            <br />
            antibody
          </td>
          <td className={abcell}>
            monoclonal
            <br />
            antibody
          </td>
          <td className={abcell}>
            polyclonal
            <br />
            antibody
          </td>
          <td>
            delete
            <br />
            gene
          </td>
        </tr>
      </thead>
      <tbody>
        {genes.map(gene => (
          <GeneStudiedRow
            key={gene.id}
            abcell={abcell}
            gene={gene}
            onAbClick={({ gene, antibody: ab }) => console.log(gene, ab)}
          />
        ))}
      </tbody>
    </table>
  )
}

export default GenesStudiedTable
