/**
 * Initial state for the GeneStudiedTable reducer
 * This object captures the current set of genes, those that are selected,
 * and total/selected counts for all genes, updated genes and split genes.
 */
export const initialState = {
  genes: new Set(),
  selectedGenes: new Set(),
  counts: {
    // All Genes
    genes: {
      selected: 0,
      total: 0,
    },
    // Genes that were updated
    updated: {
      selected: 0,
      total: 0,
    },
    // Genes that were split.
    split: {
      selected: 0,
      total: 0,
    },
  },
}

// Gene types: all genes, split genes, updated genes
const types = ['genes', 'split', 'updated']

/**
 * This function updates the counts for a particular count type (selected or total)
 * for a list of genes.
 *
 * @param counts - The current state of the counts.
 * @param countType - The count type we are updated ('total' or 'selected').
 * @param genes - The Set of genes to calculate counts for.
 * @returns {Object} - A new counts object with updated values.
 */
const updateCounts = (counts, countType, genes) => {
  // Copy the current counts state.
  const updatedCounts = { ...counts }
  // Init all the counts for this count type to 0.
  types.forEach((type) => (updatedCounts[type][countType] = 0))
  genes.forEach((gene) => {
    // Increment count for all genes.
    updatedCounts.genes[countType] += 1
    // If gene is updated or split add it to the count for that
    // type of gene.
    if (gene?.status === 'updated' || gene?.status === 'split') {
      updatedCounts[gene.status][countType] += 1
    }
  })
  return updatedCounts
}

/**
 * Return the non symmetric difference for two Sets.
 * e.g.
 * const setA = new Set([1, 2, 3, 4])
 * const setB = new Set([3, 4, 5, 6])
 *
 * const diff = difference(setA, setB)
 * console.log(diff)
 * // Set([1, 2])
 *
 * @param geneSetA - Set to iterate through.
 * @param geneSetB - Set to check for values from the first Set.
 * @returns {Set<*>} - A new Set representing the non symmetric difference.
 */
const difference = (geneSetA, geneSetB) =>
  new Set([...geneSetA].filter((g) => !geneSetB.has(g)))

/**
 * Reducer used to update the complext state based on user issued actions.
 * @param state - The current state.
 * @param action - The user defined action.
 * @returns {Object} - Updated state
 */
export const reducer = (state, action) => {
  let counts = {}
  let { selectedGenes } = state
  switch (action.type) {
    case 'SET_SELECTED':
      // Create a new set from the user supplied selected genes Set/list.
      selectedGenes = new Set(action?.payload ?? [])
      // Get updated counts for selected genes.
      counts = updateCounts(state.counts, 'selected', selectedGenes)
      // Return the updated state.
      return {
        ...state,
        selectedGenes,
        counts,
      }
    case 'SET_GENES':
      // Create a new set from the user supplied gene list.
      const genes = new Set(action?.payload ?? [])
      // Update gene list counts.
      counts = updateCounts(state.counts, 'total', genes)

      // If some genes are selected, check to make sure that the
      // new gene list contains them.
      if (state.selectedGenes.size !== 0) {
        const removedGenes = difference(selectedGenes, genes)
        // Remove any genes that are selected but not in the updated gene list.
        if (removedGenes.size > 0) {
          removedGenes.forEach((gene) => selectedGenes.delete(gene))
          // Update selected gene counts.
          counts = updateCounts(counts, 'selected', selectedGenes)
        }
      }
      // Return updated state.
      return {
        ...state,
        genes,
        counts,
        selectedGenes,
      }

    default:
      throw new Error(`Invalid action type received: ${action.type}`)
  }
}
