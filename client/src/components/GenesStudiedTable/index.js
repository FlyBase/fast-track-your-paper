import React from 'react'

import './index.css'

import { useStateFromProp } from 'hooks/useStateFromProp'

const GenesStudiedTable = ({ showAbs = false, genes = null }) => {
  let abcell = showAbs ? '' : 'abcell'

  return (
    <>
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
          <tr>
            <th>
              <a href="/reports/FBgn0013765" target="_blank">
                cnn
              </a>
            </th>
            <td className={abcell}>
              <input
                type="radio"
                name="FBgn0013765_ab"
                id="FBgn0013765_none"
                checked
              />
            </td>
            <td className={abcell}>
              <input type="radio" name="FBgn0013765_ab" id="FBgn0013765_mono" />
            </td>
            <td className={abcell}>
              <input type="radio" name="FBgn0013765_ab" id="FBgn0013765_poly" />
            </td>
            <td>
              <a onclick="removeFromChosenGenes('FBgn0013765')">
                <i class="fa fa-close"></i>
              </a>
            </td>
          </tr>
          {genes}
        </tbody>
      </table>
    </>
  )
}

export default GenesStudiedTable
