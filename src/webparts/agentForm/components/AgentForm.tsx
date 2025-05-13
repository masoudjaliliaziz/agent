import * as React from 'react';
import styles from './AgentForm.module.scss';
import { IAgentFormProps } from './IAgentFormProps';
import { escape } from '@microsoft/sp-lodash-subset';
require("./Styles/font.css");
export default class AgentForm extends React.Component<IAgentFormProps, {}> {
  public render(): React.ReactElement<IAgentFormProps> {
    return (
      <div className={ styles.agentForm }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <span className={ styles.title }>Welcome to SharePoint!</span>
              <p className={ styles.subTitle }>Customize SharePoint experiences using Web Parts.</p>
              <p className={ styles.description }>{escape(this.props.description)}</p>
              <a href="https://aka.ms/spfx" className={ styles.button }>
                <span className={ styles.label }>Learn more</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
