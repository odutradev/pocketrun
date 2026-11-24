package page

import pagerepository "pocketrun-api/internal/repositories/page"

type (
	Page        = pagerepository.Page
	Sort        = pagerepository.Sort
	ListQuery   = pagerepository.ListQuery
	GroupTotals = pagerepository.GroupTotals
)

const (
	SortRecent   = pagerepository.SortRecent
	SortClicks   = pagerepository.SortClicks
	SortTitle    = pagerepository.SortTitle
	SortExpiring = pagerepository.SortExpiring
)
