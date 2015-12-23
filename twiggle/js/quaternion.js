//quaternion rotation function
function quaternionRotationMatrix (axis, angle) {
	var rot = new Float32Array(16);

	var s = Math.cos(angle/2.0);
	var wx = Math.sin(angle/2.0)*axis[0];
	var wy = Math.sin(angle/2.0)*axis[1];
	var wz = Math.sin(angle/2.0)*axis[2];


	rot[0] = 1-2.0*wy*wy-2.0*wz*wz;
	rot[1] = 2.0*wx*wy+2.0*s*wz;
	rot[2] = 2.0*wx*wz-2.0*s*wy;
	rot[3] = 0;
	rot[4] = 2.0*wx*wy-2.0*s*wz;
	rot[5] = 1-2.0*wx*wx-2.0*wz*wz;
	rot[6] = 2.0*wy*wz+2.0*s*wx;
	rot[7] = 0;
	rot[8] = 2.0*wx*wz+2.0*s*wy;
	rot[9] = 2.0*wy*wz-2.0*s*wx;
	rot[10] = 1-2.0*wx*wx-2.0*wy*wy;
	rot[11] = 0;
	rot[12] = 0;
	rot[13] = 0;
	rot[14] = 0;
	rot[15] = 1;

	return rot;
}