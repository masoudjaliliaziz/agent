import * as React from "react";
import styles from "./AgentForm.module.scss";
import { IAgentFormProps, IAgentFormState } from "./IAgentFormProps"; // فرض بر این است که این به‌درستی تعریف شده باشد
import { escape } from "@microsoft/sp-lodash-subset";
import Form from "./Form/Form";
import { handleAddEvent } from "./Crud/AddData";
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
    const guid = "0f492e61-c4a0-4177-8bd8-2a4bd46e5f9f";
    this.setState({ parent_GUID: guid });
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
