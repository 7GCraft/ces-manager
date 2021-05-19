module.exports = class RootComponentCollection {
    /**
     * Constructor for root component collection object
     * @param {Array} components array of component objects
     */
    constructor(components) {
        this.parent = {};
        this.root = {};
        this.componentDict = {};

        if (components == null)
            return;

        // Initialisation loop
        // 1. Set all component's parent to its parent Id
        // 2. Create a component dictionary, where:
        //    - Key -> Component ID, Value -> Component object
        for (let component of components) {
            if (component.parentId == undefined) {
                this.parent[component.componentId] = null;
            }
            else {
                this.parent[component.componentId] = component.parentId;
            }
            this.componentDict[component.componentId] = component;
        }

        for (let i = 0; i < components.length; i++) {
            this.findParent(components[i].componentId);
        }

        this.createRoot();
    }

    /**
     * Find parent Id of a component.
     * ONLY USE THIS FOR CREATING DISJOINT SETS!
     * @param {Number} componentId must be an integer
     * @return {Number} parent Id
     */
    findParent(componentId) {
        if (this.parent[componentId] == null) {
            return componentId;
        }
        else {
            const parentId = this.findParent(this.parent[componentId]);
            this.parent[componentId] = parentId;
            return parentId
        }
    }

    /**
     * Merge first and second component parents.
     * ONLY USE THIS FOR CREATING DISJOINT SETS!
     * @param {Number} firstComponentId must be an integer
     * @param {Number} secondComponentId must be an integers
     */
    union(firstComponentId, secondComponentId) {
        const firstParentId = this.findParent(firstComponentId);
        const secondParentId = this.findParent(secondComponentId);
        this.parent[firstParentId] = secondParentId;
    }

    /**
     * Create root array.
     * Root component of component's tree.
     */
    createRoot() {
        for (let componentId in this.parent) {
            let parentId = this.parent[componentId];
            if (parentId == null) {
                this.root[componentId] = this.componentDict[componentId];
            }
        }
    }

    /**
     * Find root component by component Id
     * @param {Number} componentId must be an integer
     * @return {Component} component object, or null if component id doesn't exist
     */
    findRoot(componentId) {
        let rootId = this.parent[componentId];
        if (rootId === undefined) {
            return null;
        }
        else if (rootId === null) {
            rootId = componentId;
        }
        return this.root[rootId];
    }
}