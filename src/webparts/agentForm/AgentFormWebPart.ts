import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-webpart-base";

import * as strings from "AgentFormWebPartStrings";
import AgentForm from "./components/AgentForm";
import { IAgentFormProps } from "./components/IAgentFormProps";
import AppRouter from "./components/Router/AppRouter";

export interface IAgentFormWebPartProps {
  description: string;
}

export default class AgentFormWebPart extends BaseClientSideWebPart<IAgentFormWebPartProps> {
  public render(): void {
    ReactDom.render(
      React.createElement(AppRouter, {
        description: this.properties.description,
      }),
      this.domElement
    );
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
