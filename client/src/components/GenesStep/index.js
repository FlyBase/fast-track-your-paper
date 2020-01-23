import React from 'react'

const GenesStep = ({ service, geens, children }) => (
  <>
    <div className="container">
      <div className="panel panel-primary">
        <div className="panel-heading">
          <h3 className="panel-title">Associate Genes</h3>
        </div>
        <div className="panel-body">
          <form>{children}</form>
        </div>
      </div>
    </div>
  </>
)

export default GenesStep
