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
    const hash = window.location.hash; // مثلاً "#/?guid=5882d265-23bf-4867-956b-7c22783c59a0"

    if (hash) {
      const hashParams = new URLSearchParams(hash.replace("#/?", ""));
      const guid = hashParams.get("guid");

      if (guid) {
        this.setState({ parent_GUID: guid });
      }
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
