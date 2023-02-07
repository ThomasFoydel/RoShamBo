import React from 'react';
import { Button } from '@mui/material';
import { DropzoneDialog } from 'mui-file-dropzone';

const ImageUpload = ({
  props: {
    toggle,
    text,
    show,
    handleFile,
    handleDelete,
    buttonText,
    handleSubmit,
    btnClass,
  },
}) => {
  return (
    <div>
      <Button className={btnClass} onClick={toggle}>
        {buttonText}
      </Button>
      <DropzoneDialog
        open={show}
        onChange={handleFile}
        onClose={toggle}
        onDelete={handleDelete}
        acceptedFiles={['image/jpeg', 'image/png']}
        maxFileSize={5000000}
        filesLimit={1}
        showFileNamesInPreview={false}
        showFileNames={false}
        dropzoneText={text}
        getFileAddedMessage={() => 'file added!'}
        getFileRemovedMessage={() => 'file removed!'}
        onAlert={(alert) => console.log({ alert })}
        getFileLimitExceedMessage={() => 'file is too big'}
        getDropRejectMessage={() => 'invalid file type'}
        onSave={handleSubmit}
      />
    </div>
  );
};

export default ImageUpload;
