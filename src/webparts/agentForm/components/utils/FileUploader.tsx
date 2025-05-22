import React = require("react");
import styles from "../Form/Upload.module.scss";

export class FileUploader extends React.Component<any, any> {
  private inputId: string;

  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      uploadStatus: "",
      uploadProgress: 0,
    };

    // ID یکتا برای input
    this.inputId = "fileInput_" + Math.random().toString(36).substr(2, 9);
  }

  uploadFile = () => {
    const selectedFile = this.state.selectedFile;
    const orderNumber = this.props.orderNumber;
    const subFolder = this.props.subFolder;
    const isSend = this.props.title === "فایل ارسالی";
    const subTypeFolder = isSend ? "send" : "recive";

    if (!selectedFile) {
      this.setState({ uploadStatus: "لطفاً فایل را انتخاب کنید" });
      return;
    }
    if (!orderNumber) {
      this.setState({ uploadStatus: "لطفاً شماره سفارش را وارد کنید" });
      return;
    }

    const cleanOrderNumber = orderNumber.replace(/[#%*<>?\/\\|]/g, "_");
    const webUrl = "https://crm.zarsim.com";
    const libraryName = "Attach1";
    const fullFolderPath = `${libraryName}/${cleanOrderNumber}/${subFolder}/${subTypeFolder}`;

    fetch(`${webUrl}/_api/contextinfo`, {
      method: "POST",
      headers: {
        Accept: "application/json;odata=verbose",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const digest = data.d.GetContextWebInformation.FormDigestValue;

        const createFolder = (path) =>
          fetch(`${webUrl}/_api/web/folders/add('${path}')`, {
            method: "POST",
            headers: {
              Accept: "application/json;odata=verbose",
              "X-RequestDigest": digest,
            },
          }).catch(() => {});

        return createFolder(`${libraryName}/${cleanOrderNumber}`)
          .then(() =>
            createFolder(`${libraryName}/${cleanOrderNumber}/${subFolder}`)
          )
          .then(() => createFolder(fullFolderPath))
          .then(() => ({ digest }));
      })
      .then(async ({ digest }) => {
        const cleanFileName = selectedFile.name.replace(/[#%*<>?\/\\|]/g, "_");
        const arrayBuffer = await selectedFile.arrayBuffer();

        return fetch(
          `${webUrl}/_api/web/GetFolderByServerRelativeUrl('${fullFolderPath}')/Files/add(overwrite=true, url='${cleanFileName}')`,
          {
            method: "POST",
            body: arrayBuffer,
            headers: {
              Accept: "application/json;odata=verbose",
              "X-RequestDigest": digest,
            },
          }
        );
      })
      .then((uploadRes) => {
        if (uploadRes.ok) {
          this.setState({
            uploadStatus: "فایل با موفقیت آپلود شد",
            uploadProgress: 100,
          });
        } else {
          throw new Error("خطا در آپلود فایل");
        }
      })
      .catch((error) => {
        console.error("خطا:", error);
        this.setState({
          uploadStatus: "خطا در آپلود فایل",
          uploadProgress: 0,
        });
      });
  };

  clearSelectedFile = () => {
    this.setState({
      selectedFile: null,
      uploadStatus: "",
      uploadProgress: 0,
    });
    const inputElem = document.getElementById(this.inputId) as HTMLInputElement;
    if (inputElem) inputElem.value = "";
  };

  render() {
    return (
      <div className={styles.uploaderDiv}>
        <label htmlFor={this.inputId}>انتخاب فایل</label>

        <input
          id={this.inputId}
          type="file"
          onChange={(e) =>
            this.setState({
              selectedFile: (e.target as HTMLInputElement).files[0],
              uploadStatus: "",
              uploadProgress: 0,
            })
          }
        />

        <div className={styles.alertContainer}>
          <div
            className={
              this.state.uploadProgress === 100
                ? styles.alertStatusSuccess
                : styles.alertStatusFailed
            }
          >
            {this.state.uploadStatus}
          </div>

          {this.state.selectedFile && (
            <div className={styles.fileInfo}>
              <p className={styles.fileName}>{this.state.selectedFile.name}</p>
              <button
                className={styles.removeFileBtn}
                onClick={this.clearSelectedFile}
                aria-label="پاک کردن فایل انتخاب شده"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className={
            this.props.title === "فایل ارسالی"
              ? styles.sendBtn
              : styles.reciveBtn
          }
          onClick={this.uploadFile}
        >
          {this.props.title}
        </button>
      </div>
    );
  }
}
