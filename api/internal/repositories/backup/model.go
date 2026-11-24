package backup

import "errors"

const StagingPrefix = "restore."

var ErrDuplicateDocument = errors.New("backup has duplicate documents")
