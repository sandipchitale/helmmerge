import { Component } from '@angular/core';
import * as jsYaml from 'js-yaml';
import * as _ from 'lodash';

class YamlFile {
  id = -1;
  path = '';
  contents = '';
  showWhenSelected = true;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  id = 0;
  yamlFiles: YamlFile[];
  selectedYamlFiles: YamlFile[];
  sidebarVisible = true;

  mergedYamlAsJSON = '';

  constructor() {
    this.yamlFiles = [];
    this.selectedYamlFiles = [];
  }

  moveFileUp(index: number) {
    const fileAtIndex = this.yamlFiles[index];
    this.yamlFiles[index] = this.yamlFiles[index - 1];
    this.yamlFiles[index - 1] = fileAtIndex;
    this.onSelection();
  }

  moveFileDown(index: number) {
    const fileAtIndex = this.yamlFiles[index];
    this.yamlFiles[index] = this.yamlFiles[index + 1];
    this.yamlFiles[index + 1] = fileAtIndex;
    this.onSelection();
  }

  removeFile(index: number) {
    this.yamlFiles.splice(index, 1);
  }

  onSelection() {

    const selectedIndices: Array<number> = [];
    this.selectedYamlFiles.forEach((selectedYamlFile) => {
      const index = this.yamlFiles.findIndex((yamlFile) => yamlFile.id === selectedYamlFile.id);
      if (index != -1) {
        selectedIndices.push(index);
      }
    });

    selectedIndices.sort();

    const yamlJSONs: string[] = [];
    selectedIndices.forEach((index: number) => {
      yamlJSONs.push(jsYaml.load(this.yamlFiles[index].contents) as any);
    });

    this.mergedYamlAsJSON = this.yamlMerge(...yamlJSONs)
  }

  yamlMerge(...yamlJSONs: any[]): string {
    const yamls: any[] = [...yamlJSONs];
    const outputJSON = _.mergeWith({}, ...yamls);
    //   (objValue: any, srcValue: any) => {
    //   // if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    //   //   return [...srcValue];
    //   // }
    //   // handle it just like with _.merge
    //   return undefined;
    // });
    return jsYaml.dump(outputJSON, {
      indent: 2,
      lineWidth: 120,
      noRefs: true
    });
  }

  async uploadHandler(event: any, upload: any) {
    const files = event.files;
    for (let file of files) {
      const reader = new FileReader();
      if (reader) {
        reader.onload = () => {
          this.yamlFiles.push(
              {
                id: this.id++,
                path: file.name,
                contents: reader.result as string,
                showWhenSelected: true
              }
            );
        };
        reader.readAsText(file);
      }
    }
    upload.clear();
  }


}
