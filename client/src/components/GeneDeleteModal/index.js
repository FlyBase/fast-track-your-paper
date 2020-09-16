import React from 'react'
import Button from 'react-bootstrap/lib/Button'
import Modal from 'react-bootstrap/lib/Modal'

// eslint-disable-next-line
import styles from 'styled-components/macro'

const GeneDeleteModal = ({ show = false, handleClose = () => {} }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title
          css={`
            font-size: 3rem;
          `}>
          Remove Genes?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p
          css={`
            font-size: 1.7rem;
          `}>
          You selected <b>No genes studied in this publication</b> which will
          remove any genes you have already associated with your submission.
        </p>
        <h4>
          Please click to confirm removing all genes from this submission.
        </h4>
      </Modal.Body>
      <Modal.Footer>
        <Button
          css={`
            margin-right: 60px;
          `}
          bsSize="large"
          bsStyle="primary"
          onClick={handleClose}>
          Keep Genes
        </Button>
        <Button
          bsSize="small"
          bsStyle="danger"
          onClick={(e) => handleClose(e, 'delete')}>
          <i className="fa fa-trash"></i> Delete Genes
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
export default GeneDeleteModal
