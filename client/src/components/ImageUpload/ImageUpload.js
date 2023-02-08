import { Button } from '@mui/material'
import { DropzoneDialog } from 'mui-file-dropzone'

const ImageUpload = ({
  props: { text, show, toggle, btnClass, buttonText, handleFile, handleDelete, handleSubmit },
}) => {
  return (
    <div>
      <Button className={btnClass} onClick={toggle}>
        {buttonText}
      </Button>
      <DropzoneDialog
        open={show}
        filesLimit={1}
        onClose={toggle}
        dropzoneText={text}
        maxFileSize={5000000}
        onChange={handleFile}
        onSave={handleSubmit}
        showFileNames={false}
        onDelete={handleDelete}
        showFileNamesInPreview={false}
        getFileAddedMessage={() => 'file added!'}
        acceptedFiles={['image/jpeg', 'image/png']}
        onAlert={(alert) => console.log({ alert })}
        getFileRemovedMessage={() => 'file removed!'}
        getDropRejectMessage={() => 'invalid file type'}
        getFileLimitExceedMessage={() => 'file is too big'}
      />
    </div>
  )
}

export default ImageUpload
