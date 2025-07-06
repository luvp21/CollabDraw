import type { Shape, Tool, StrokeWidth, StrokeColor, FillColor } from "@/types/canvas"

export class DrawingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private roomId: string;
  private socket: WebSocket;
  private shapes: Shape[] = [];
  private selectedShapeIds: string[] = [];
  
  // Drawing state
  private isDrawing = false;
  private isPanning = false;
  private currentTool: Tool = "select";
  private strokeWidth: StrokeWidth = 2;
  private strokeColor: StrokeColor = "#000000";
  private fillColor: FillColor = "transparent";
  
  // Canvas state
  private scale = 1;
  private panX = 0;
  private panY = 0;
  private startX = 0;
  private startY = 0;
  private lastPanX = 0;
  private lastPanY = 0;
  
  // Selection state
  private selectionBox: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null = null;
  
  // Callbacks
  private onScaleChange: (scale: number) => void;
  private onSelectionChange?: (shapeIds: string[]) => void;

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    initialShapes: any[],
    onScaleChange: (scale: number) => void,
    onSelectionChange?: (shapeIds: string[]) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;
    this.onScaleChange = onScaleChange;
    this.onSelectionChange = onSelectionChange;

    this.setupCanvas();
    this.loadInitialShapes(initialShapes);
    this.setupEventListeners();
    this.setupSocketListeners();
    this.render();
  }

  private setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Handle resize
    window.addEventListener("resize", () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.render();
    });
  }

  private loadInitialShapes(initialShapes: any[]) {
    this.shapes = initialShapes.map((shapeData: any) => {
      try {
        const parsed = JSON.parse(shapeData.data);
        return {
          ...parsed.shape,
          id: shapeData.id.toString(),
          userId: shapeData.userId,
          timestamp: Date.now(),
        };
      } catch (error) {
        console.error("Failed to parse shape:", error);
        return null;
      }
    }).filter(Boolean);
  }

  private setupEventListeners() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
    this.canvas.addEventListener("wheel", this.handleWheel);
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    
    // Keyboard shortcuts
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  private setupSocketListeners() {
    this.socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case "draw":
          this.handleRemoteDraw(data);
          break;
        case "erase":
          this.handleRemoteErase(data);
          break;
        case "select":
          this.handleRemoteSelect(data);
          break;
      }
    });
  }

  private handleRemoteDraw(data: any) {
    try {
      const parsed = JSON.parse(data.data);
      const shape = {
        ...parsed.shape,
        id: `remote-${Date.now()}-${Math.random()}`,
        userId: data.userId || "unknown",
        timestamp: Date.now(),
      };
      
      this.shapes.push(shape);
      this.render();
    } catch (error) {
      console.error("Failed to handle remote draw:", error);
    }
  }

  private handleRemoteErase(data: any) {
    try {
      const parsed = JSON.parse(data.data);
      this.shapes = this.shapes.filter(
        shape => shape.id !== parsed.shapeId
      );
      this.render();
    } catch (error) {
      console.error("Failed to handle remote erase:", error);
    }
  }

  private handleRemoteSelect(data: any) {
    try {
      const parsed = JSON.parse(data.data);
      // Handle remote selection updates if needed
      this.render();
    } catch (error) {
      console.error("Failed to handle remote select:", error);
    }
  }

  private handleMouseDown = (e: MouseEvent) => {
    const point = this.getCanvasPoint(e.clientX, e.clientY);
    this.startX = point.x;
    this.startY = point.y;
    this.lastPanX = e.clientX;
    this.lastPanY = e.clientY;

    switch (this.currentTool) {
      case "select":
        this.handleSelectMouseDown(point, e);
        break;
      case "pencil":
        this.isDrawing = true;
        this.startPencilDrawing(point);
        break;
      case "eraser":
        this.isDrawing = true;
        this.eraseAtPoint(point);
        break;
      case "hand":
        this.isPanning = true;
        this.canvas.style.cursor = "grabbing";
        break;
      case "rectangle":
      case "ellipse":
      case "line":
        this.isDrawing = true;
        break;
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    const point = this.getCanvasPoint(e.clientX, e.clientY);

    if (this.isPanning) {
      this.panCanvas(e.clientX - this.lastPanX, e.clientY - this.lastPanY);
      this.lastPanX = e.clientX;
      this.lastPanY = e.clientY;
      return;
    }

    if (!this.isDrawing) return;

    switch (this.currentTool) {
      case "select":
        this.handleSelectMouseMove(point);
        break;
      case "rectangle":
      case "ellipse":
      case "line":
        this.previewShape(point);
        break;
      case "pencil":
        this.continuePencilDrawing(point);
        break;
      case "eraser":
        this.eraseAtPoint(point);
        break;
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    const point = this.getCanvasPoint(e.clientX, e.clientY);

    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = "grab";
      return;
    }

    if (!this.isDrawing) return;
    
    this.isDrawing = false;

    switch (this.currentTool) {
      case "select":
        this.handleSelectMouseUp(point);
        break;
      case "rectangle":
        this.finishRectangle(point);
        break;
      case "ellipse":
        this.finishEllipse(point);
        break;
      case "line":
        this.finishLine(point);
        break;
      case "pencil":
        this.finishPencilDrawing();
        break;
    }
  };

  private handleSelectMouseDown(point: { x: number; y: number }, e: MouseEvent) {
    const clickedShape = this.getShapeAtPoint(point);
    
    if (clickedShape) {
      if (!e.shiftKey) {
        this.selectedShapeIds = [clickedShape.id];
      } else {
        if (this.selectedShapeIds.includes(clickedShape.id)) {
          this.selectedShapeIds = this.selectedShapeIds.filter(id => id !== clickedShape.id);
        } else {
          this.selectedShapeIds.push(clickedShape.id);
        }
      }
      this.onSelectionChange?.(this.selectedShapeIds);
    } else {
      if (!e.shiftKey) {
        this.selectedShapeIds = [];
        this.onSelectionChange?.([]);
      }
      this.isDrawing = true;
      this.selectionBox = {
        startX: point.x,
        startY: point.y,
        endX: point.x,
        endY: point.y
      };
    }
    this.render();
  }

  private handleSelectMouseMove(point: { x: number; y: number }) {
    if (this.selectionBox) {
      this.selectionBox.endX = point.x;
      this.selectionBox.endY = point.y;
      this.render();
    }
  }

  private handleSelectMouseUp(point: { x: number; y: number }) {
    if (this.selectionBox) {
      const selectedShapes = this.getShapesInSelection(this.selectionBox);
      this.selectedShapeIds = selectedShapes.map(shape => shape.id);
      this.onSelectionChange?.(this.selectedShapeIds);
      this.selectionBox = null;
      this.render();
    }
  }

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    
    const scaleAmount = -e.deltaY / 1000;
    const newScale = Math.max(0.1, Math.min(5, this.scale * (1 + scaleAmount)));
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Zoom towards mouse position
    const canvasMouseX = (mouseX - this.panX) / this.scale;
    const canvasMouseY = (mouseY - this.panY) / this.scale;
    
    this.panX -= canvasMouseX * (newScale - this.scale);
    this.panY -= canvasMouseY * (newScale - this.scale);
    
    this.scale = newScale;
    this.onScaleChange(Math.round(this.scale * 100));
    this.render();
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      this.deleteSelectedShapes();
    }
    if (e.key === "Escape") {
      this.selectedShapeIds = [];
      this.onSelectionChange?.([]);
      this.render();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    // Handle key up events if needed
  };

  private getCanvasPoint(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - this.panX) / this.scale,
      y: (clientY - rect.top - this.panY) / this.scale,
    };
  }

  private getShapeAtPoint(point: { x: number; y: number }): Shape | null {
    // Check shapes in reverse order (top to bottom)
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      if (this.isPointInShape(point, this.shapes[i])) {
        return this.shapes[i];
      }
    }
    return null;
  }

  private getShapesInSelection(selectionBox: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  }): Shape[] {
    const minX = Math.min(selectionBox.startX, selectionBox.endX);
    const maxX = Math.max(selectionBox.startX, selectionBox.endX);
    const minY = Math.min(selectionBox.startY, selectionBox.endY);
    const maxY = Math.max(selectionBox.startY, selectionBox.endY);

    return this.shapes.filter(shape => {
      const bounds = this.getShapeBounds(shape);
      return bounds.x >= minX && bounds.x + bounds.width <= maxX &&
             bounds.y >= minY && bounds.y + bounds.height <= maxY;
    });
  }

  private getShapeBounds(shape: Shape): { x: number; y: number; width: number; height: number } {
    switch (shape.type) {
      case "rectangle":
        return {
          x: shape.x,
          y: shape.y,
          width: shape.width || 0,
          height: shape.height || 0
        };
      case "ellipse":
        return {
          x: shape.x - (shape.width || 0),
          y: shape.y - (shape.height || 0),
          width: (shape.width || 0) * 2,
          height: (shape.height || 0) * 2
        };
      case "line":
        return {
          x: Math.min(shape.x, shape.width || 0),
          y: Math.min(shape.y, shape.height || 0),
          width: Math.abs((shape.width || 0) - shape.x),
          height: Math.abs((shape.height || 0) - shape.y)
        };
      case "pencil":
        if (!shape.points || shape.points.length === 0) {
          return { x: shape.x, y: shape.y, width: 0, height: 0 };
        }
        const xs = shape.points.map(p => p.x);
        const ys = shape.points.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        };
      default:
        return { x: shape.x, y: shape.y, width: 0, height: 0 };
    }
  }

  private deleteSelectedShapes() {
    if (this.selectedShapeIds.length === 0) return;

    this.selectedShapeIds.forEach(shapeId => {
      const shape = this.shapes.find(s => s.id === shapeId);
      if (shape) {
        this.broadcastErase(shape);
      }
    });

    this.shapes = this.shapes.filter(shape => !this.selectedShapeIds.includes(shape.id));
    this.selectedShapeIds = [];
    this.onSelectionChange?.([]);
    this.render();
  }

  private startPencilDrawing(point: { x: number; y: number }) {
    const shape: Shape = {
      id: `pencil-${Date.now()}-${Math.random()}`,
      type: "pencil",
      x: point.x,
      y: point.y,
      points: [point],
      strokeWidth: this.strokeWidth,
      strokeColor: this.strokeColor,
      fillColor: "transparent",
      userId: "current-user",
      timestamp: Date.now(),
    };
    
    this.shapes.push(shape);
  }

  private continuePencilDrawing(point: { x: number; y: number }) {
    const currentShape = this.shapes[this.shapes.length - 1];
    if (currentShape && currentShape.type === "pencil" && currentShape.points) {
      currentShape.points.push(point);
      this.render();
    }
  }

  private finishPencilDrawing() {
    const currentShape = this.shapes[this.shapes.length - 1];
    if (currentShape && currentShape.type === "pencil") {
      this.broadcastShape(currentShape);
    }
  }

  private previewShape(point: { x: number; y: number }) {
    this.render();
    
    const width = point.x - this.startX;
    const height = point.y - this.startY;
    
    this.ctx.save();
    this.ctx.setTransform(this.scale, 0, 0, this.scale, this.panX, this.panY);
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.lineWidth = this.strokeWidth;
    this.ctx.setLineDash([5, 5]);
    
    if (this.fillColor !== "transparent") {
      this.ctx.fillStyle = this.fillColor;
    }
    
    switch (this.currentTool) {
      case "rectangle":
        this.ctx.strokeRect(this.startX, this.startY, width, height);
        if (this.fillColor !== "transparent") {
          this.ctx.fillRect(this.startX, this.startY, width, height);
        }
        break;
      case "ellipse":
        this.ctx.beginPath();
        this.ctx.ellipse(
          this.startX + width / 2,
          this.startY + height / 2,
          Math.abs(width / 2),
          Math.abs(height / 2),
          0, 0, 2 * Math.PI
        );
        this.ctx.stroke();
        if (this.fillColor !== "transparent") {
          this.ctx.fill();
        }
        break;
      case "line":
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(point.x, point.y);
        this.ctx.stroke();
        break;
    }
    
    this.ctx.restore();
  }

  private finishRectangle(point: { x: number; y: number }) {
    const width = point.x - this.startX;
    const height = point.y - this.startY;
    
    if (Math.abs(width) < 2 && Math.abs(height) < 2) return;
    
    const shape: Shape = {
      id: `rect-${Date.now()}-${Math.random()}`,
      type: "rectangle",
      x: this.startX,
      y: this.startY,
      width,
      height,
      strokeWidth: this.strokeWidth,
      strokeColor: this.strokeColor,
      fillColor: this.fillColor,
      userId: "current-user",
      timestamp: Date.now(),
    };
    
    this.shapes.push(shape);
    this.broadcastShape(shape);
    this.render();
  }

  private finishEllipse(point: { x: number; y: number }) {
    const width = point.x - this.startX;
    const height = point.y - this.startY;
    
    if (Math.abs(width) < 2 && Math.abs(height) < 2) return;
    
    const shape: Shape = {
      id: `ellipse-${Date.now()}-${Math.random()}`,
      type: "ellipse",
      x: this.startX + width / 2,
      y: this.startY + height / 2,
      width: Math.abs(width / 2),
      height: Math.abs(height / 2),
      strokeWidth: this.strokeWidth,
      strokeColor: this.strokeColor,
      fillColor: this.fillColor,
      userId: "current-user",
      timestamp: Date.now(),
    };
    
    this.shapes.push(shape);
    this.broadcastShape(shape);
    this.render();
  }

  private finishLine(point: { x: number; y: number }) {
    const distance = Math.hypot(point.x - this.startX, point.y - this.startY);
    if (distance < 2) return;
    
    const shape: Shape = {
      id: `line-${Date.now()}-${Math.random()}`,
      type: "line",
      x: this.startX,
      y: this.startY,
      width: point.x,
      height: point.y,
      strokeWidth: this.strokeWidth,
      strokeColor: this.strokeColor,
      fillColor: "transparent",
      userId: "current-user",
      timestamp: Date.now(),
    };
    
    this.shapes.push(shape);
    this.broadcastShape(shape);
    this.render();
  }

  private eraseAtPoint(point: { x: number; y: number }) {
    const shapeToErase = this.getShapeAtPoint(point);
    
    if (shapeToErase) {
      this.shapes = this.shapes.filter(shape => shape.id !== shapeToErase.id);
      this.broadcastErase(shapeToErase);
      this.render();
    }
  }

  private isPointInShape(point: { x: number; y: number }, shape: Shape): boolean {
    const tolerance = Math.max(5, shape.strokeWidth * 2);
    
    switch (shape.type) {
      case "rectangle":
        return point.x >= shape.x - tolerance &&
               point.x <= shape.x + (shape.width || 0) + tolerance &&
               point.y >= shape.y - tolerance &&
               point.y <= shape.y + (shape.height || 0) + tolerance;
      
      case "ellipse":
        const dx = point.x - shape.x;
        const dy = point.y - shape.y;
        const rx = (shape.width || 0) + tolerance;
        const ry = (shape.height || 0) + tolerance;
        return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
      
      case "line":
        const lineLength = Math.hypot((shape.width || 0) - shape.x, (shape.height || 0) - shape.y);
        if (lineLength === 0) return false;
        
        const distance = Math.abs(
          ((shape.height || 0) - shape.y) * point.x -
          ((shape.width || 0) - shape.x) * point.y +
          (shape.width || 0) * shape.y -
          (shape.height || 0) * shape.x
        ) / lineLength;
        
        // Check if point is within line segment bounds
        const minX = Math.min(shape.x, shape.width || 0);
        const maxX = Math.max(shape.x, shape.width || 0);
        const minY = Math.min(shape.y, shape.height || 0);
        const maxY = Math.max(shape.y, shape.height || 0);
        
        return distance <= tolerance &&
               point.x >= minX - tolerance &&
               point.x <= maxX + tolerance &&
               point.y >= minY - tolerance &&
               point.y <= maxY + tolerance;
      
      case "pencil":
        return shape.points?.some(p => 
          Math.hypot(p.x - point.x, p.y - point.y) <= tolerance
        ) || false;
      
      default:
        return false;
    }
  }

  private panCanvas(deltaX: number, deltaY: number) {
    this.panX += deltaX;
    this.panY += deltaY;
    this.render();
  }

  private broadcastShape(shape: Shape) {
    this.socket.send(JSON.stringify({
      type: "draw",
      data: JSON.stringify({ shape }),
      roomId: this.roomId,
    }));
  }

  private broadcastErase(shape: Shape) {
    this.socket.send(JSON.stringify({
      type: "erase",
      data: JSON.stringify({ shapeId: shape.id }),
      roomId: this.roomId,
    }));
  }

  private render() {
    // Clear canvas
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set background
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    this.drawGrid();
    
    // Apply transform
    this.ctx.setTransform(this.scale, 0, 0, this.scale, this.panX, this.panY);
    
    // Draw all shapes
    this.shapes.forEach(shape => {
      const isSelected = this.selectedShapeIds.includes(shape.id);
      this.drawShape(shape, isSelected);
    });
    
    // Draw selection box
    if (this.selectionBox) {
      this.drawSelectionBox();
    }
  }

  private drawGrid() {
    const gridSize = 20 * this.scale;
    const startX = (-this.panX % gridSize);
    const startY = (-this.panY % gridSize);
    
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.strokeStyle = "#e0e0e0";
    this.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = startX; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = startY; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  private drawShape(shape: Shape, isSelected: boolean = false) {
    this.ctx.save();
    this.ctx.strokeStyle = shape.strokeColor;
    this.ctx.lineWidth = shape.strokeWidth;
    this.ctx.setLineDash([]);
    
    if (shape.fillColor !== "transparent") {
      this.ctx.fillStyle = shape.fillColor;
    }
    
    switch (shape.type) {
      case "rectangle":
        this.ctx.strokeRect(shape.x, shape.y, shape.width || 0, shape.height || 0);
        if (shape.fillColor !== "transparent") {
          this.ctx.fillRect(shape.x, shape.y, shape.width || 0, shape.height || 0);
        }
        break;
      
      case "ellipse":
        this.ctx.beginPath();
        this.ctx.ellipse(shape.x, shape.y, shape.width || 0, shape.height || 0, 0, 0, 2 * Math.PI);
        this.ctx.stroke();
        if (shape.fillColor !== "transparent") {
          this.ctx.fill();
        }
        break;
      
      case "line":
        this.ctx.beginPath();
        this.ctx.moveTo(shape.x, shape.y);
        this.ctx.lineTo(shape.width || 0, shape.height || 0);
        this.ctx.stroke();
        break;
      
      case "pencil":
        if (shape.points && shape.points.length > 1) {
          this.ctx.beginPath();
          this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
          shape.points.forEach(point => this.ctx.lineTo(point.x, point.y));
          this.ctx.stroke();
        }
        break;
    }
    
    // Draw selection indicator
    if (isSelected) {
      this.drawSelectionIndicator(shape);
    }
    
    this.ctx.restore();
  }

  private drawSelectionIndicator(shape: Shape) {
    const bounds = this.getShapeBounds(shape);
    const padding = 5;
    
    this.ctx.save();
    this.ctx.strokeStyle = "#007bff";
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    
    this.ctx.strokeRect(
      bounds.x - padding,
      bounds.y - padding,
      bounds.width + padding * 2,
      bounds.height + padding * 2
    );
    
    this.ctx.restore();
  }

  private drawSelectionBox() {
    if (!this.selectionBox) return;
    
    const width = this.selectionBox.endX - this.selectionBox.startX;
    const height = this.selectionBox.endY - this.selectionBox.startY;
    
    this.ctx.save();
    this.ctx.strokeStyle = "#007bff";
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    this.ctx.fillStyle = "rgba(0, 123, 255, 0.1)";
    
    this.ctx.fillRect(this.selectionBox.startX, this.selectionBox.startY, width, height);
    this.ctx.strokeRect(this.selectionBox.startX, this.selectionBox.startY, width, height);
    
    this.ctx.restore();
  }

  // Public methods
  public setTool(tool: Tool) {
    this.currentTool = tool;
    this.selectedShapeIds = [];
    this.onSelectionChange?.([]);
    
    // Update cursor
    switch (tool) {
      case "hand":
        this.canvas.style.cursor = "grab";
        break;
      case "pencil":
        this.canvas.style.cursor = "crosshair";
        break;
      case "eraser":
        this.canvas.style.cursor = "crosshair";
        break;
      case "select":
        this.canvas.style.cursor = "default";
        break;
      default:
        this.canvas.style.cursor = "crosshair";
    }
    
    this.render();
  }

  public setStrokeWidth(width: StrokeWidth) {
    this.strokeWidth = width;
  }

  public setStrokeColor(color: StrokeColor) {
    this.strokeColor = color;
  }

  public setFillColor(color: FillColor) {
    this.fillColor = color;
  }

  public resetCanvas() {
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.onScaleChange(100);
    this.render();
  }

  public zoomIn() {
    this.scale = Math.min(5, this.scale * 1.2);
    this.onScaleChange(Math.round(this.scale * 100));
    this.render();
  }

  public zoomOut() {
    this.scale = Math.max(0.1, this.scale / 1.2);
    this.onScaleChange(Math.round(this.scale * 100));
    this.render();
  }

  public fitToScreen() {
    if (this.shapes.length === 0) return;

    // Calculate bounds of all shapes
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    this.shapes.forEach(shape => {
      const bounds = this.getShapeBounds(shape);
      minX = Math.min(minX, bounds.x);
      minY = Math.min(minY, bounds.y);
      maxX = Math.max(maxX, bounds.x + bounds.width);
      maxY = Math.max(maxY, bounds.y + bounds.height);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const padding = 50;

    const scaleX = (this.canvas.width - padding * 2) / contentWidth;
    const scaleY = (this.canvas.height - padding * 2) / contentHeight;
    this.scale = Math.min(scaleX, scaleY, 2);

    this.panX = (this.canvas.width - contentWidth * this.scale) / 2 - minX * this.scale;
    this.panY = (this.canvas.height - contentHeight * this.scale) / 2 - minY * this.scale;

    this.onScaleChange(Math.round(this.scale * 100));
    this.render();
  }

  public exportCanvas(): string {
    // Create a temporary canvas for export
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d')!;
    
    // Calculate content bounds
    if (this.shapes.length === 0) {
      exportCanvas.width = 800;
      exportCanvas.height = 600;
    } else {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      this.shapes.forEach(shape => {
        const bounds = this.getShapeBounds(shape);
        minX = Math.min(minX, bounds.x);
        minY = Math.min(minY, bounds.y);
        maxX = Math.max(maxX, bounds.x + bounds.width);
        maxY = Math.max(maxY, bounds.y + bounds.height);
      });

      const padding = 20;
      exportCanvas.width = Math.max(800, maxX - minX + padding * 2);
      exportCanvas.height = Math.max(600, maxY - minY + padding * 2);
      
      // Set white background
      exportCtx.fillStyle = '#ffffff';
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      // Translate to center content
      exportCtx.translate(-minX + padding, -minY + padding);
    }

    // Draw all shapes
    this.shapes.forEach(shape => {
      this.drawShapeOnContext(exportCtx, shape);
    });

    return exportCanvas.toDataURL('image/png');
  }

  private drawShapeOnContext(ctx: CanvasRenderingContext2D, shape: Shape) {
    ctx.save();
    ctx.strokeStyle = shape.strokeColor;
    ctx.lineWidth = shape.strokeWidth;
    ctx.setLineDash([]);
    
    if (shape.fillColor !== "transparent") {
      ctx.fillStyle = shape.fillColor;
    }
    
    switch (shape.type) {
      case "rectangle":
        ctx.strokeRect(shape.x, shape.y, shape.width || 0, shape.height || 0);
        if (shape.fillColor !== "transparent") {
          ctx.fillRect(shape.x, shape.y, shape.width || 0, shape.height || 0);
        }
        break;
      
      case "ellipse":
        ctx.beginPath();
        ctx.ellipse(shape.x, shape.y, shape.width || 0, shape.height || 0, 0, 0, 2 * Math.PI);
        ctx.stroke();
        if (shape.fillColor !== "transparent") {
          ctx.fill();
        }
        break;
      
      case "line":
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y);
        ctx.lineTo(shape.width || 0, shape.height || 0);
        ctx.stroke();
        break;
      
      case "pencil":
        if (shape.points && shape.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          shape.points.forEach(point => ctx.lineTo(point.x, point.y));
          ctx.stroke();
        }
        break;
    }
    
    ctx.restore();
  }

  public clearCanvas() {
    this.shapes = [];
    this.selectedShapeIds = [];
    this.onSelectionChange?.([]);
    
    // Broadcast clear action
    this.socket.send(JSON.stringify({
      type: "clear",
      roomId: this.roomId,
    }));
    
    this.render();
  }

  public undo() {
    if (this.shapes.length === 0) return;
    
    const lastShape = this.shapes[this.shapes.length - 1];
    if (lastShape.userId === "current-user") {
      this.shapes.pop();
      this.broadcastErase(lastShape);
      this.render();
    }
  }

  public duplicateSelected() {
    if (this.selectedShapeIds.length === 0) return;
    
    const selectedShapes = this.shapes.filter(shape => 
      this.selectedShapeIds.includes(shape.id)
    );
    
    const newShapes: Shape[] = [];
    const offset = 20;
    
    selectedShapes.forEach(shape => {
      const newShape: Shape = {
        ...shape,
        id: `${shape.type}-${Date.now()}-${Math.random()}`,
        x: shape.x + offset,
        y: shape.y + offset,
        userId: "current-user",
        timestamp: Date.now(),
      };
      
      if (shape.points) {
        newShape.points = shape.points.map(p => ({
          x: p.x + offset,
          y: p.y + offset
        }));
      }
      
      newShapes.push(newShape);
      this.shapes.push(newShape);
      this.broadcastShape(newShape);
    });
    
    // Select the new shapes
    this.selectedShapeIds = newShapes.map(shape => shape.id);
    this.onSelectionChange?.(this.selectedShapeIds);
    this.render();
  }

  public getSelectedShapes(): Shape[] {
    return this.shapes.filter(shape => this.selectedShapeIds.includes(shape.id));
  }

  public getShapeCount(): number {
    return this.shapes.length;
  }

  public getZoom(): number {
    return Math.round(this.scale * 100);
  }

  public setZoom(zoom: number) {
    this.scale = Math.max(0.1, Math.min(5, zoom / 100));
    this.onScaleChange(Math.round(this.scale * 100));
    this.render();
  }

  public destroy() {
    // Clean up event listeners
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("wheel", this.handleWheel);
    
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
    
    window.removeEventListener("resize", () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.render();
    });
  }
}