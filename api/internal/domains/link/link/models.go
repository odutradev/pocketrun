package link

import linkrepository "pocketrun-api/internal/repositories/link"

type (
	Link        = linkrepository.Link
	Sort        = linkrepository.Sort
	ListQuery   = linkrepository.ListQuery
	GroupTotals = linkrepository.GroupTotals
)

const (
	SortRecent   = linkrepository.SortRecent
	SortClicks   = linkrepository.SortClicks
	SortTitle    = linkrepository.SortTitle
	SortExpiring = linkrepository.SortExpiring
)
