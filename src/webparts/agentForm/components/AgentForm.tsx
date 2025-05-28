import * as React from "react";
import styles from "./AgentForm.module.scss";
import { IAgentFormProps, IAgentFormState } from "./IAgentFormProps";
import Form from "./Form/Form";
require("./Styles/font.css");

export default class AgentForm extends React.Component<
  IAgentFormProps,
  IAgentFormState
> {




  constructor(props: IAgentFormProps) {
    super(props);
    this.state = {
      parent_GUID: "",
    };
  }

componentDidMount() {
  let guidFromUrl = "";
  const hash = window.location.hash;

  if (hash) {
    const hashParams = new URLSearchParams(hash.replace("#/?", ""));
    const guid = hashParams.get("guid");

    if (guid) {
      guidFromUrl = guid;
      sessionStorage.setItem("agent_guid", guid); // فقط برای این تب ذخیره می‌شه
      this.setState({ parent_GUID: guid });
      return;
    }
  }

  const guidFromStorage = sessionStorage.getItem("agent_guid"); // از sessionStorage می‌خونه
  if (guidFromStorage) {
    this.setState({ parent_GUID: guidFromStorage });
  }
}



  public render(): React.ReactElement<IAgentFormProps> {
    return (
      <div className={styles.agentForm}>
        <div className={styles.container}>
          <Form parent_GUID={this.state.parent_GUID} />
        </div>
      </div>
    );
  }



}
